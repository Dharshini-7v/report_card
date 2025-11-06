import java.sql.*;
import java.util.*;

public class DatabaseConnector {
    private static Connection conn;
    // In-memory storage for reports (fallback when DB is not available)
    private static final List<ReportModel.Result> reports = new ArrayList<>();
    private static final Object reportsLock = new Object();

    public static void init(Properties cfg) {
        String url = cfg.getProperty("db.url");
        String user = cfg.getProperty("db.user");
        String pass = cfg.getProperty("db.pass");
        try {
            // Load PostgreSQL driver explicitly
            Class.forName("org.postgresql.Driver");
            int attempts = 0;
            int maxAttempts = 10;
            while (attempts < maxAttempts) {
                try {
                    conn = DriverManager.getConnection(url, user, pass);
                    System.out.println("[SUCCESS] PostgreSQL connected successfully!");
                    break;
                } catch (Exception inner) {
                    attempts++;
                    if (attempts >= maxAttempts) throw inner;
                    try { Thread.sleep(1000); } catch (InterruptedException ie) { /* ignore */ }
                }
            }
        } catch (Exception e) {
            System.out.println("[ERROR] Database connection failed: " + e.getMessage());
            System.out.println("[INFO] Using in-memory storage for reports");
            e.printStackTrace();
        }
    }

    public static Connection getConnection() {
        return conn;
    }

    // Save report to in-memory storage (and DB if available)
    public static void saveReport(ReportModel.Result report) {
        if (report == null) return;
        
        synchronized (reportsLock) {
            reports.add(report);
        }
        
        // TODO: Also save to database if connection is available
        // if (conn != null) {
        //     // Save to database
        // }
    }

    // Fetch summary from all stored reports
    public static ReportModel.Summary fetchSummary() {
        synchronized (reportsLock) {
            if (reports.isEmpty()) {
                return null;
            }
            
            // Calculate summary from all reports
            double totalAverage = 0;
            int totalStudents = 0;
            Map<String, Integer> gradeCounts = new HashMap<>();
            
            for (ReportModel.Result report : reports) {
                if (report.students != null) {
                    for (ReportModel.StudentResult student : report.students) {
                        totalAverage += student.average;
                        totalStudents++;
                        gradeCounts.put(student.grade, gradeCounts.getOrDefault(student.grade, 0) + 1);
                    }
                }
            }
            
            ReportModel.Summary summary = new ReportModel.Summary();
            summary.classAverage = totalStudents > 0 ? totalAverage / totalStudents : 0;
            summary.gradeCounts = gradeCounts;
            
            return summary;
        }
    }
    
    // Get all reports (for displaying student results)
    public static List<ReportModel.Result> getAllReports() {
        synchronized (reportsLock) {
            return new ArrayList<>(reports);
        }
    }
}
