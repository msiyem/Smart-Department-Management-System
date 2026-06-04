/**
 * Converts a numeric mark to letter grade + GPA point.
 * Grading scale (adjust to your university standard).
 */
export function calcGrade(marks) {
  if (marks >= 80) return { grade: 'A+', gpa: 4.00 };
  if (marks >= 75) return { grade: 'A',  gpa: 3.75 };
  if (marks >= 70) return { grade: 'A-', gpa: 3.50 };
  if (marks >= 65) return { grade: 'B+', gpa: 3.25 };
  if (marks >= 60) return { grade: 'B',  gpa: 3.00 };
  if (marks >= 55) return { grade: 'B-', gpa: 2.75 };
  if (marks >= 50) return { grade: 'C+', gpa: 2.50 };
  if (marks >= 45) return { grade: 'C',  gpa: 2.25 };
  if (marks >= 40) return { grade: 'D',  gpa: 2.00 };
  return { grade: 'F', gpa: 0.00 };
}

/**
 * Recalculates a student's CGPA from all their results.
 * @param {Array<{credit: number, gpa: number}>} results
 */
export function calcCGPA(results) {
  if (!results.length) return 0;
  const totalCredits  = results.reduce((s, r) => s + Number(r.credit), 0);
  const weightedTotal = results.reduce((s, r) => s + Number(r.gpa) * Number(r.credit), 0);
  return totalCredits === 0 ? 0 : +(weightedTotal / totalCredits).toFixed(2);
}
