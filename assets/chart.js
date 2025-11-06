// chart.js — handles data visualization in Dashboard

// Fetch summary data from backend
async function loadChartData() {
  try {
    const res = await fetch('/summary');
    const data = await res.json();

    if (!data || !data.subjectAverages) {
      console.error("No chart data found");
      return;
    }

    // Example backend response:
    // {
    //   "subjectAverages": [75, 80, 68],
    //   "overallAverage": 74.33,
    //   "studentsCount": 10
    // }

    renderSubjectChart(data.subjectAverages);
    renderOverallChart(data.overallAverage, data.studentsCount);

  } catch (err) {
    console.error("Error loading chart data:", err);
  }
}

// Subject-wise bar chart
function renderSubjectChart(subjectAverages) {
  const ctx = document.getElementById("subjectChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Subject 1", "Subject 2", "Subject 3"],
      datasets: [{
        label: "Average Marks",
        data: subjectAverages,
        borderWidth: 2,
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)"
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)"
        ]
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Marks (%)" }
        },
        x: {
          title: { display: true, text: "Subjects" }
        }
      }
    }
  });
}

// Overall pie chart
function renderOverallChart(overallAverage, studentsCount) {
  const ctx = document.getElementById("overallChart").getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Average", "Remaining to 100%"],
      datasets: [{
        label: "Class Performance",
        data: [overallAverage, 100 - overallAverage],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 99, 132, 0.3)"
        ]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Overall Class Average (${studentsCount} Students)`
        }
      }
    }
  });
}

// Initialize chart when page loads
document.addEventListener("DOMContentLoaded", loadChartData);
