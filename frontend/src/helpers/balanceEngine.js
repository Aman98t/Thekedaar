// Pure calculation engine for worker attendance matrices and advances
export const calculateWorkerBalances = (labours, sites, attendance, paymentLedger) => {
    return labours.map(worker => {
      let grossEarnings = 0;
      let daysPresent = 0;
      let daysHalf = 0;
      let daysAbsent = 0;
  
      sites.forEach(site => {
        const siteAttendance = attendance[site.id] || {};
        const status = siteAttendance[worker.id];
  
        if (status === 'Present') {
          grossEarnings += worker.dailyWage;
          daysPresent++;
        } else if (status === 'Half-Day') {
          grossEarnings += (worker.dailyWage / 2);
          daysHalf++;
        } else if (status === 'Absent') {
          daysAbsent++;
        }
      });
  
      const totalAdvances = paymentLedger
        .filter(p => p.labourId === worker.id)
        .reduce((sum, p) => sum + p.amount, 0);
  
      const netDue = grossEarnings - totalAdvances;
  
      return {
        ...worker,
        grossEarnings,
        totalAdvances,
        netDue,
        stats: { daysPresent, daysHalf, daysAbsent }
      };
    });
  };
  
  // Pure client-side CSV spreadsheet downloader
  export const triggerCSVExport = (ledgerData, workersList) => {
    const headers = ['Transaction ID', 'Labour Name', 'Trade Speciality', 'Project Node', 'Disbursed Amount', 'Heading Type', 'Timestamp'];
    
    const rows = ledgerData.map(txn => {
      const worker = workersList.find(w => w.id === txn.labourId);
      return [
        txn.id,
        worker ? worker.name : 'Unknown',
        worker ? worker.trade : 'N/A',
        txn.siteId,
        `INR ${txn.amount}`,
        txn.type,
        txn.dateTime
      ];
    });
  
    const content = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Thekedaar_Payout_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };
  
  // Auto-formatting generator for messaging slips
  export const dispatchWhatsAppReceipt = (worker, txn) => {
    const formattedMsg = `*THEKEDAAR ENTERPRISE RECEIPT*%0A------------------------------------%0A*Recipient:* ${worker.name}%0A*Speciality:* ${worker.trade}%0A*Cash Outflow:* ₹${txn.amount}%0A*Heading:* ${txn.type}%0A*Timestamp:* ${txn.dateTime}%0A------------------------------------%0A_This transaction is securely stamped on your Mobile Passbook account._`;
    window.open(`https://wa.me/${worker.phone.replace(/[\s+]/g, '')}?text=${formattedMsg}`, '_blank');
  };