function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('ระบบจัดการชั้นเรียน')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function checkPassword(pass) {
  const MASTER_PASS = "1234"; // รหัสผ่านสำหรับครู
  return pass === MASTER_PASS;
}

function recordData(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; 
    const data = sheet.getDataRange().getValues();
    const idToFind = payload.studentId.trim();
    
    let rowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0].toString() === idToFind) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex !== -1) {
      // 1. เช็คชื่อ (C=3, D=4, E=5)
      if (payload.attendanceCol) {
        let col = parseInt(payload.attendanceCol);
        let currentAtt = sheet.getRange(rowIndex, col).getValue() || 0;
        sheet.getRange(rowIndex, col).setValue(currentAtt + 1);
      }

      // 2. คะแนนงานและสอบ (F=6 ถึง J=10)
      const scoreCols = [6, 7, 8, 9, 10];
      const scores = [payload.work1, payload.work2, payload.work3, payload.midterm, payload.final];
      
      scoreCols.forEach((col, index) => {
        let currentVal = sheet.getRange(rowIndex, col).getValue() || 0;
        let inputVal = parseFloat(scores[index]) || 0;
        sheet.getRange(rowIndex, col).setValue(currentVal + inputVal);
      });
      
      return { status: "success", message: "บันทึกและอัปเดตคะแนนรหัส " + idToFind + " สำเร็จ" };
    } else {
      return { status: "error", message: "ไม่พบรหัสนักเรียน" };
    }
  } catch (e) {
    return { status: "error", message: "ข้อผิดพลาด: " + e.toString() };
  }
}

function getStudentScore(studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === studentId.trim()) {
      return {
        found: true,
        name: data[i][1],        // B
        att_present: data[i][2],  // C
        att_leave: data[i][3],    // D
        att_sick: data[i][4],     // E
        work1: data[i][5],       // F
        work2: data[i][6],       // G
        work3: data[i][7],       // H
        midterm: data[i][8],     // I
        final: data[i][9],       // J
        behavior: data[i][10],   // K
        total: data[i][11],      // L
        grade: data[i][12]       // M
      };
    }
  }
  return { found: false };
}
