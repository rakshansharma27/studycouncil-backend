function downloadPDF() {
    const user = getSession();
    if (user.plan !== 'pro') {
        showUpgradeModal("PDF Downloads are a Pro Feature.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const question = document.getElementById('askInput').value;
    const synthesis = document.getElementById('synthText').innerText;

    doc.setFillColor(255, 107, 0);
    doc.rect(0, 0, 210, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("StudyCouncil ✦", 10, 14);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Question:", 10, 30);
    doc.setFont("helvetica", "normal");
    const splitQ = doc.splitTextToSize(question, 190);
    doc.text(splitQ, 10, 38);

    let yPos = 38 + (splitQ.length * 6) + 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(10, yPos, 200, yPos);
    yPos += 10;

    doc.setTextColor(255, 107, 0);
    doc.setFont("helvetica", "bold");
    doc.text("CHAIRMAN SYNTHESIS", 10, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    const splitS = doc.splitTextToSize(synthesis, 190);
    doc.text(splitS, 10, yPos);

    doc.save('StudyCouncil-Answer.pdf');
}