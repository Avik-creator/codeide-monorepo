import http from "http";
import chokidar from "chokidar";
import express, { Request, Response } from "express";
import os from "os";
import { Server as SocketServer } from "socket.io";
import * as pty from "node-pty";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";
import { exec as execCallback } from "child_process";
import util from "util";
import crypto from "crypto";
import session from "express-session";

// Use environment variables for configuration
const PORT = process.env.PORT || 9000;

// Promisify exec for easier usage with async/await
const execAsync = util.promisify(execCallback);

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Set up CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// Initialize Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: "*", // Allow any origin
  },
});

// Map to store socket directories
const socketDirs: Map<string, string> = new Map();

// Parse JSON body requests
app.use(express.json());

// Set up sessions
app.use(
  session({
    secret: "fhsdkjfhsa,djf,kdshf,ksdbhfksajhbdfkgjhdfgksgdfkhj",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Determine the appropriate shell based on the OS
const shell = os.platform() === "win32" ? "powershell.exe" : "/bin/bash";

// Initialize pty.js for terminal emulation
const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cwd: process.env.HOME, // Adjust the working directory
  env: process.env,
});

// Send terminal data to client via socket.io
ptyProcess.onData((data: string) => {
  io.emit("terminal:data", data);
});

// Handle incoming socket.io connections
io.on("connection", socket => {
  console.log(`Socket connected: ${socket.id}`);
  fs.mkdir(process.env.HOME + "/user", { recursive: true });

  // Handle disconnection
  socket.on("disconnect", async () => {
    const dir = socketDirs.get(socket.id);
    console.log(`Socket disconnected: ${socket.id}`);
    if (dir) {
      try {
        await deleteDir(dir);
        socketDirs.delete(socket.id);
      } catch (error) {
        console.error(`Error deleting directory for socket ${socket.id}:`, error);
      }
    }
  });
});

// API to send commands to the terminal
app.post("/api/terminal", (req: Request, res: Response) => {
  const { data } = req.body;
  console.log(`Terminal command: ${data}`);
  ptyProcess.write(data);
  res.sendStatus(200);
});

// Ensure BASE_DIR exists
fs.mkdir(process.env.HOME + "/user", { recursive: true })
  .then(() => console.log(`Ensured users exists`))
  .catch(err => console.error(`Error creating users:`, err));

// Serve file tree
app.get("/files", async (req: Request, res: Response) => {
  try {
    const tree = await getFileListTree(process.env.HOME + "/user");
    return res.json(tree);
  } catch (error) {
    console.error("Error fetching file tree:", error);
    res.status(500).send("Error fetching file tree");
  }
});

// Serve file content
app.get("/files/:filePath(*)", async (req: Request, res: Response) => {
  try {
    const { filePath } = req.params;
    if (!filePath) {
      return res.status(400).send("File path is required");
    }
    const fullPath = path.join(process.env.HOME + "/user", filePath);
    const fileContent = await fs.readFile(fullPath, "utf-8");
    res.set("Content-Type", "text/plain");
    res.send(fileContent);
  } catch (error) {
    console.error("Error fetching file content:", error);
    res.status(500).send("Error fetching file content");
  }
  app.post("/files/:filePath(*)", async (req: Request, res: Response) => {
    try {
      const { filePath } = req.params;
      if (!filePath) {
        return res.status(400).send("File path is required");
      }
      const { content } = req.body;
      const fullPath = path.join(process.env.HOME + "/user", filePath);
      await fs.writeFile(fullPath, content, "utf-8");
      res.status(200).send("File saved successfully");
    } catch (error) {
      console.error("Error saving file content:", error);
      res.status(500).send("Error saving file content");
    }
  });
});

// Create a new file
app.post("/create-file", async (req: Request, res: Response) => {
  try {
    const { path: filePath } = req.body;
    if (!filePath) {
      return res.status(400).send("File path is required");
    }
    const fullPath = path.join(process.env.HOME + "/user", filePath);
    await fs.writeFile(fullPath, "", "utf-8");
    res.status(201).send("File created successfully");
    io.emit("file-change", { event: "add", path: filePath });
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).send("Error creating file");
  }
});

// Create a new folder
app.post("/create-folder", async (req: Request, res: Response) => {
  try {
    const { path: folderPath } = req.body;
    if (!folderPath) {
      return res.status(400).send("Folder path is required");
    }
    const fullPath = path.join(process.env.HOME + "/user", folderPath);
    await fs.mkdir(fullPath, { recursive: true });
    res.status(201).send("Folder created successfully");
    io.emit("file-change", { event: "addDir", path: folderPath });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send("Error creating folder");
  }
});

// Helper function to create a temporary directory
async function createTempDir(): Promise<string> {
  const tempDir = path.join(os.tmpdir(), "code-execution", crypto.randomBytes(16).toString("hex"));
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

// Helper function to create session directory
async function createSessionDir(sessionId: string): Promise<string> {
  const dir = path.join(os.tmpdir(), "code-execution", sessionId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

// Helper function to delete a directory
async function deleteDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error deleting directory ${dirPath}:`, error);
  }
}

// Helper function to extract class name from Java code
function extractClassName(code: string): string | null {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] ?? null : null;
}

const sessionDirs: Map<string, string> = new Map();

// Run Java code
app.post("/run-java", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).send("Java code is required");
    }

    let sessionDir = sessionDirs.get(req.session.id!);
    if (!sessionDir) {
      sessionDir = await createSessionDir(req.session.id!);
      sessionDirs.set(req.session.id!, sessionDir);
    }

    const className = extractClassName(code);
    if (!className) {
      return res.status(400).send("Unable to determine the public class name.");
    }

    const fileName = `${className}.java`;
    const filePath = path.join(sessionDir, fileName);

    // Write the Java code to a file
    await fs.writeFile(filePath, code);

    // Compile the Java file
    const compileResult = await execAsync(`javac ${filePath}`);
    if (compileResult.stderr) {
      ptyProcess.write(compileResult.stderr + "\r");
      return res.status(400).send(compileResult.stderr);
    }

    // Run the Java program
    const { stdout, stderr } = await execAsync(`java -cp ${sessionDir} ${className}`);

    if (stderr) {
      ptyProcess.write(stderr + "\r");
      res.status(400).send(stderr);
    } else {
      ptyProcess.write(`java -cp ${sessionDir} ${className}\r`);
      res.status(200).send(stdout);
    }
  } catch (error: any) {
    console.error("Error running Java code:", error);
    ptyProcess.write(error.message + "\r");
    res.status(500).send(error.message);
  }
});

// Run C++ code
app.post("/run-cpp", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).send("C++ code is required");
    }

    let sessionDir = sessionDirs.get(req.session.id!);
    if (!sessionDir) {
      sessionDir = await createSessionDir(req.session.id!);
      sessionDirs.set(req.session.id!, sessionDir);
    }

    const fileName = "main.cpp";
    const filePath = path.join(sessionDir, fileName);

    // Write the C++ code to a file
    await fs.writeFile(filePath, code);

    // Compile the C++ file
    const compileCommand = `g++ ${filePath} -o ${path.join(sessionDir, "main")}`;
    const compileResult = await execAsync(compileCommand);
    if (compileResult.stderr) {
      return res.status(400).send(compileResult.stderr);
    }

    // Run the compiled C++ program
    const { stdout, stderr } = await execAsync(`${path.join(sessionDir, "main")}`);

    if (stderr) {
      ptyProcess.write(stderr + "\r");
      res.status(400).send(stderr);
    } else {
      ptyProcess.write(`${path.join(sessionDir, "main")}\r`);
      res.status(200).send(stdout);
    }
  } catch (error: any) {
    console.error("Error running C++ code:", error);
    res.status(500).send(error.message);
  }
});

// Watch the "users" directory for file changes and emit them via Socket.IO
const watcher = chokidar.watch(process.env.HOME + "/user", { ignored: /(^|[/\\])\../, persistent: true });

watcher
  .on("add", filePath => io.emit("file-change", { event: "add", path: filePath }))
  .on("addDir", dirPath => io.emit("file-change", { event: "addDir", path: dirPath }))
  .on("unlink", filePath => io.emit("file-change", { event: "unlink", path: filePath }))
  .on("unlinkDir", dirPath => io.emit("file-change", { event: "unlinkDir", path: dirPath }))
  .on("error", error => console.error("Watcher error:", error));

async function getFileListTree(dir: string): Promise<any> {
  const tree: any = {};

  async function treelist(curdir: string, currtree: any) {
    const files: string[] = await fs.readdir(curdir);
    await Promise.all(
      files.map(async (file: string) => {
        if (file === "node_modules") return;

        const filepath: string = path.join(curdir, file);
        const stat = await fs.stat(filepath);
        if (stat.isDirectory()) {
          currtree[file] = {};
          await treelist(filepath, currtree[file]);
        } else {
          currtree[file] = null;
        }
      })
    );
  }

  await treelist(dir, tree);
  return tree;
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
