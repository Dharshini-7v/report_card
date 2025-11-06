// ReportProcessor.java
import java.util.*;
import java.util.concurrent.*;

public class ReportProcessor {
    // processes list of StudentInput multithreaded
    public static ReportModel.Result process(List<ReportModel.StudentInput> students) throws Exception {
        int cores = Math.max(2, Runtime.getRuntime().availableProcessors());
        ExecutorService pool = Executors.newFixedThreadPool(cores);
        List<Future<ReportModel.StudentResult>> futures = new ArrayList<>();
        for (ReportModel.StudentInput s : students) {
            futures.add(pool.submit(() -> compute(s)));
        }
        List<ReportModel.StudentResult> results = new ArrayList<>();
        for (Future<ReportModel.StudentResult> f : futures) {
            results.add(f.get());
        }
        pool.shutdown();

        // summary
        double total = 0; int count = 0;
        Map<String,Integer> gradeCounts = new HashMap<>();
        for (ReportModel.StudentResult r : results) {
            total += r.average; count++;
            gradeCounts.put(r.grade, gradeCounts.getOrDefault(r.grade,0)+1);
        }
        ReportModel.Summary s = new ReportModel.Summary();
        s.classAverage = count==0 ? 0 : total/count;
        s.gradeCounts = gradeCounts;
        ReportModel.Result res = new ReportModel.Result();
        res.students = results;
        res.summary = s;
        return res;
    }

    private static ReportModel.StudentResult compute(ReportModel.StudentInput in) {
        int[] marks = in.marks;
        int sum = 0;
        int bestIdx = 0;
        int best = -1;
        for (int i=0;i<marks.length;i++) {
            sum += marks[i];
            if (marks[i] > best) { best = marks[i]; bestIdx = i; }
        }
        double avg = marks.length==0 ? 0 : ((double)sum) / marks.length;
        String grade;
        if (avg >= 90) grade = "A+";
        else if (avg >= 75) grade = "A";
        else if (avg >= 60) grade = "B";
        else if (avg >= 50) grade = "C";
        else grade = "F";
        String remark = avg >= 90 ? "Outstanding" : avg >= 75 ? "Very Good" : avg >= 60 ? "Good" : avg >= 50 ? "Satisfactory" : "Needs Improvement";

        ReportModel.StudentResult r = new ReportModel.StudentResult();
        r.name = in.name;
        r.average = avg;
        r.grade = grade;
        r.bestSubject = "Subject " + (bestIdx+1);
        r.remark = remark;
        r.marks = in.marks;
        return r;
    }
}
