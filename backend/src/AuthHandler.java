// AuthHandler.java
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.security.MessageDigest;

public class AuthHandler {
    // NOTE: demo only. In production store hashed passwords in DB.
    private static final Map<String, String> USERS = new ConcurrentHashMap<>();

    public static void init() {
        // demo: default admin
        USERS.put("admin", hash("1234"));
    }

    public static Map<String,Object> signup(Map<String,String> body) {
        String user = body.getOrDefault("username","").trim();
        String pass = body.getOrDefault("password","");
        Map<String,Object> r = new HashMap<>();
        if (user.isEmpty() || pass.isEmpty()) {
            r.put("status","error"); r.put("message","Missing username/password"); return r;
        }
        if (USERS.containsKey(user)) {
            r.put("status","error"); r.put("message","User exists"); return r;
        }
        USERS.put(user, hash(pass));
        r.put("status","success"); return r;
    }

    public static Map<String,Object> login(Map<String,String> body) {
        String user = body.getOrDefault("username","").trim();
        String pass = body.getOrDefault("password","");
        Map<String,Object> r = new HashMap<>();
        if (user.isEmpty() || pass.isEmpty()) {
            r.put("status","error"); r.put("message","Missing username/password"); return r;
        }
        String stored = USERS.get(user);
        if (stored != null && stored.equals(hash(pass))) {
            r.put("status","success"); r.put("username", user); return r;
        } else {
            r.put("status","error"); r.put("message","Invalid credentials"); return r;
        }
    }

    private static String hash(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] b = md.digest(s.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte x:b) sb.append(String.format("%02x", x));
            return sb.toString();
        } catch (Exception e) { return s; }
    }
}

