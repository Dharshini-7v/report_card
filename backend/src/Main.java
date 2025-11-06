// Main.java
import static spark.Spark.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
public class Main {
    private static final Gson GSON = new Gson();
    public static void main(String[] args) throws Exception {
        // Get project root directory (assumes we're in backend/src or backend/classes)
        String currentDir = System.getProperty("user.dir");
        Path projectRoot;
        if (currentDir.endsWith("src") || currentDir.endsWith("classes")) {
            projectRoot = Paths.get(currentDir).getParent().getParent();
        } else if (currentDir.endsWith("backend")) {
            projectRoot = Paths.get(currentDir).getParent();
        } else {
            projectRoot = Paths.get(currentDir);
        }
        
        // Load config
        Properties cfg = new Properties();
        try {
            String appEnv = System.getenv("APP_ENV");
            String cfgFile = (appEnv != null && appEnv.equalsIgnoreCase("docker"))
                ? "backend/resources/config.docker.properties"
                : "backend/resources/config.properties";
            Path configPath = projectRoot.resolve(cfgFile);
            cfg.load(Files.newBufferedReader(configPath));
        } catch (Exception e) { 
            System.out.println("Cannot load config: " + e.getMessage()); 
        }

        int portNum = Integer.parseInt(cfg.getProperty("server.port", "4567"));
        ipAddress("0.0.0.0");
        port(portNum);

        // Serve static files (frontend folder)
        Path frontendPath = projectRoot.resolve("frontend");
        if (Files.exists(frontendPath) && Files.isDirectory(frontendPath)) {
            staticFiles.externalLocation(frontendPath.toAbsolutePath().toString());
        } else {
            System.out.println("Warning: Frontend directory not found at: " + frontendPath.toAbsolutePath());
        }

        DatabaseConnector.init(cfg);

        // Simple in-memory user cache (for demo)
        AuthHandler.init();

        // Routes
        post("/signup", (req, res) -> {
            res.type("application/json");
            Map<String,String> body = GSON.fromJson(req.body(), Map.class);
            return GSON.toJson(AuthHandler.signup(body));
        });

        post("/login", (req, res) -> {
            res.type("application/json");
            Map<String,String> body = GSON.fromJson(req.body(), Map.class);
            return GSON.toJson(AuthHandler.login(body));
        });

        post("/processReport", (req, res) -> {
            res.type("application/json");
            try {
                JsonObject input = GSON.fromJson(req.body(), JsonObject.class);
                if (input == null) {
                    res.status(400);
                    Map<String, String> error = new HashMap<>();
                    error.put("status", "error");
                    error.put("message", "Invalid JSON");
                    return GSON.toJson(error);
                }
                // expected: { "students":[{name,marks:[..]}], "meta":{...} }
                List<ReportModel.StudentInput> students = new ArrayList<>();
                JsonArray arr = input.getAsJsonArray("students");
                if (arr != null) {
                    for (JsonElement e : arr) {
                        JsonObject o = e.getAsJsonObject();
                        if (o == null) continue;
                        if (!o.has("name") || !o.has("marks")) continue;
                        String name = o.get("name").getAsString();
                        JsonArray marksA = o.getAsJsonArray("marks");
                        if (marksA == null) continue;
                        int[] marks = new int[marksA.size()];
                        for (int i=0;i<marksA.size();i++) marks[i] = marksA.get(i).getAsInt();
                        students.add(new ReportModel.StudentInput(name, marks));
                    }
                }
                // process multi-threaded
                ReportModel.Result response = ReportProcessor.process(students);
                // persist
                DatabaseConnector.saveReport(response);
                return GSON.toJson(response);
            } catch (Exception e) {
                res.status(500);
                Map<String, String> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", e.getMessage());
                return GSON.toJson(error);
            }
        });

        get("/summary", (req, res) -> {
            res.type("application/json");
            ReportModel.Summary s = DatabaseConnector.fetchSummary();
            return GSON.toJson(s);
        });

        get("/students", (req, res) -> {
            res.type("application/json");
            try {
                List<ReportModel.Result> allReports = DatabaseConnector.getAllReports();
                List<ReportModel.StudentResult> allStudents = new ArrayList<>();
                if (allReports != null) {
                    for (ReportModel.Result report : allReports) {
                        if (report != null && report.students != null) {
                            allStudents.addAll(report.students);
                        }
                    }
                }
                // Always return an array, even if empty
                return GSON.toJson(allStudents);
            } catch (Exception e) {
                res.status(500);
                Map<String, String> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", e.getMessage());
                return GSON.toJson(new ArrayList<>()); // Return empty array on error
            }
        });

        System.out.println("Server started at http://localhost:" + portNum);
    }
}