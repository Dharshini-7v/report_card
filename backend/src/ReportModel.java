// ReportModel.java
import java.util.*;

public class ReportModel {
    public static class StudentInput {
        public String name;
        public int[] marks;
        public StudentInput(String n, int[] m){ name=n; marks=m; }
    }
    public static class StudentResult {
        public String name;
        public int[] marks;
        public double average;
        public String grade;
        public String bestSubject;
        public String remark;
    }
    public static class Summary {
        public double classAverage;
        public Map<String,Integer> gradeCounts;
    }
    public static class Result {
        public List<StudentResult> students;
        public Summary summary;
    }
}

