import React, { useState } from 'react';
import {
  ClipboardList,
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Stethoscope,
  Info,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportCsv';

export const OperationalReportsPage: React.FC = () => {
  const { appointments, departments, doctors, patients, config } = useClinic();

  const [activeReportTab, setActiveReportTab] = useState<
    'appointments' | 'department' | 'doctor' | 'cancellations' | 'charges' | 'registrations'
  >('appointments');

  const [selectedDept, setSelectedDept] = useState('all');

  // Export handlers for CSV
  const handleExportCsv = () => {
    switch (activeReportTab) {
      case 'appointments': {
        const headers = ['Appointment ID', 'Patient Name', 'Doctor', 'Department', 'Date', 'Time Slot', 'Fee (INR)', 'Booking Charge (INR)', 'Status'];
        const rows = appointments.map(a => [
          a.id,
          a.patientName,
          a.doctorName,
          a.departmentName,
          a.date,
          a.timeSlot,
          a.consultationFee,
          a.bookingCharge,
          a.status,
        ]);
        exportToCsv('CMS_Operational_Appointments_Report', headers, rows);
        break;
      }
      case 'department': {
        const headers = ['Department Code', 'Department Name', 'Total Appointments', 'Confirmed', 'Completed', 'Cancelled'];
        const rows = departments.map(d => {
          const deptApts = appointments.filter(a => a.departmentId === d.id);
          return [
            d.code,
            d.name,
            deptApts.length,
            deptApts.filter(a => a.status === 'Confirmed').length,
            deptApts.filter(a => a.status === 'Completed').length,
            deptApts.filter(a => a.status === 'Cancelled').length,
          ];
        });
        exportToCsv('CMS_Department_Analysis_Report', headers, rows);
        break;
      }
      case 'doctor': {
        const headers = ['Doctor Name', 'Specialty', 'Department', 'Consultation Fee (INR)', 'Duty Shift', 'Room', 'Total Consultations'];
        const rows = doctors.map(d => {
          const docApts = appointments.filter(a => a.doctorId === d.id);
          return [d.fullName, d.specialty, d.departmentName, d.consultationFee, d.shiftDefault, d.roomAssigned, docApts.length];
        });
        exportToCsv('CMS_Physician_Roster_Report', headers, rows);
        break;
      }
      case 'cancellations': {
        const headers = ['Appointment ID', 'Patient Name', 'Doctor', 'Date', 'Type', 'Reason', 'Simulated Refund Status'];
        const cancelled = appointments.filter(a => a.status === 'Cancelled' || a.status === 'No-show');
        const rows = cancelled.map(a => [
          a.id,
          a.patientName,
          a.doctorName,
          a.date,
          a.isEmergencyCancellation ? 'Emergency Cancellation' : a.status,
          a.cancelReason || a.notes || 'None',
          a.refundEligibility || 'Non-refundable',
        ]);
        exportToCsv('CMS_Cancellations_Refund_Report', headers, rows);
        break;
      }
      case 'charges': {
        const headers = ['Appointment ID', 'Patient Name', 'Doctor', 'Fee (INR)', 'Booking Charge %', 'Deposit Amount (INR)', 'Charge Status'];
        const rows = appointments.map(a => [
          a.id,
          a.patientName,
          a.doctorName,
          a.consultationFee,
          `${a.bookingChargePercentage}%`,
          a.bookingCharge,
          a.chargeStatus,
        ]);
        exportToCsv('CMS_Booking_Deposit_Audit_Report', headers, rows);
        break;
      }
      case 'registrations': {
        const headers = ['Patient ID', 'Full Name', 'Email', 'Primary Phone', 'Age', 'Gender', 'Registration Date', 'Medical History Status'];
        const rows = patients.map(p => [
          p.id,
          p.fullName,
          p.email,
          p.primaryPhone,
          p.age,
          p.gender,
          p.registrationDate,
          p.diagnosisHistoryCompleted ? 'Complete' : 'Pending',
        ]);
        exportToCsv('CMS_Patient_Registrations_Report', headers, rows);
        break;
      }
    }
  };

  // Summaries
  const totalFeesCollected = appointments
    .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
    .reduce((sum, a) => sum + a.consultationFee, 0);

  const totalBookingDeposits = appointments
    .reduce((sum, a) => sum + a.bookingCharge, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operational & Financial Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade performance metrics with client-side CSV spreadsheet generation (SRS FR-36, Section 9.F)
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Report to CSV</span>
        </button>
      </div>

      <div className="p-4 rounded-3xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-brand-600 shrink-0" />
        <span>
          <strong>Notice:</strong> All report calculations are generated from prototype data structures and persistent browser storage.
        </span>
      </div>

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Projected Clinic Fees</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalFeesCollected)}</h3>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Completed & Confirmed visits</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Booking Deposits Recorded ({config.bookingChargePercentage}%)
          </span>
          <h3 className="text-2xl font-extrabold text-brand-700 mt-1">{formatCurrency(totalBookingDeposits)}</h3>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Collected at Front Desk (Offline)</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Patient Directory</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{patients.length} Registered</h3>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">{appointments.length} total appointments logged</span>
        </div>
      </div>

      {/* Report Categories Tabs */}
      <div className="bg-white p-3 rounded-3xl shadow-card border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
        {[
          { key: 'appointments', label: 'All Appointments' },
          { key: 'department', label: 'Department Distribution' },
          { key: 'doctor', label: 'Physician Utilization' },
          { key: 'cancellations', label: 'Cancellations & Refunds' },
          { key: 'charges', label: 'Booking Deposit Log' },
          { key: 'registrations', label: 'Patient Directory' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveReportTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeReportTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Table Display */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 capitalize">
            Tabular Data: {activeReportTab} Report
          </h3>
          <span className="text-xs text-slate-400">Ready for instant CSV export</span>
        </div>

        <div className="overflow-x-auto">
          {activeReportTab === 'appointments' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Apt ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor & Department</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.patientName}</td>
                    <td className="py-3.5 px-4">{a.doctorName} ({a.departmentName})</td>
                    <td className="py-3.5 px-4">{formatDateDisplay(a.date)} • {a.timeSlot}</td>
                    <td className="py-3.5 px-4 font-bold">{formatCurrency(a.consultationFee)}</td>
                    <td className="py-3.5 px-4 font-bold text-brand-700">{formatCurrency(a.bookingCharge)}</td>
                    <td className="py-3.5 px-4 text-right font-semibold">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportTab === 'department' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Head Physician</th>
                  <th className="py-3 px-4">Room Allocation</th>
                  <th className="py-3 px-4">Total Appointments</th>
                  <th className="py-3 px-4">Confirmed</th>
                  <th className="py-3 px-4 text-right">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map(d => {
                  const deptApts = appointments.filter(a => a.departmentId === d.id);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{d.name}</td>
                      <td className="py-3.5 px-4">{d.headDoctorName}</td>
                      <td className="py-3.5 px-4">{d.roomCount} Rooms</td>
                      <td className="py-3.5 px-4 font-bold text-brand-700">{deptApts.length}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">{deptApts.filter(a => a.status === 'Confirmed').length}</td>
                      <td className="py-3.5 px-4 text-right font-semibold">{deptApts.filter(a => a.status === 'Completed').length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeReportTab === 'doctor' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Physician</th>
                  <th className="py-3 px-4">Specialty & Department</th>
                  <th className="py-3 px-4">Consultation Fee</th>
                  <th className="py-3 px-4">Shift & Room</th>
                  <th className="py-3 px-4 text-right">Appointments Handled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map(doc => {
                  const docApts = appointments.filter(a => a.doctorId === doc.id);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{doc.fullName}</td>
                      <td className="py-3.5 px-4">{doc.specialty} • {doc.departmentName}</td>
                      <td className="py-3.5 px-4 font-bold">{formatCurrency(doc.consultationFee)}</td>
                      <td className="py-3.5 px-4">{doc.shiftDefault} ({doc.roomAssigned})</td>
                      <td className="py-3.5 px-4 text-right font-bold text-brand-700">{docApts.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeReportTab === 'cancellations' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Apt ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Physician</th>
                  <th className="py-3 px-4">Reason Recorded</th>
                  <th className="py-3 px-4">Cancellation Window</th>
                  <th className="py-3 px-4 text-right">Simulated Refund Determination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.filter(a => a.status === 'Cancelled' || a.status === 'No-show').map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.patientName}</td>
                    <td className="py-3.5 px-4">{a.doctorName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{a.cancelReason || a.notes || 'No-show'}</td>
                    <td className="py-3.5 px-4">
                      {a.isEmergencyCancellation ? 'Emergency (Cut-off Override)' : 'Pre-Cutoff Standard'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-brand-800">
                      {a.refundEligibility || 'Non-refundable'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportTab === 'charges' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Apt ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Physician</th>
                  <th className="py-3 px-4">Consultation Fee</th>
                  <th className="py-3 px-4">Deposit % Rate</th>
                  <th className="py-3 px-4">Calculated Deposit</th>
                  <th className="py-3 px-4 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.patientName}</td>
                    <td className="py-3.5 px-4">{a.doctorName}</td>
                    <td className="py-3.5 px-4">{formatCurrency(a.consultationFee)}</td>
                    <td className="py-3.5 px-4 font-mono">{a.bookingChargePercentage}%</td>
                    <td className="py-3.5 px-4 font-bold text-brand-700">{formatCurrency(a.bookingCharge)}</td>
                    <td className="py-3.5 px-4 text-right font-semibold">{a.chargeStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportTab === 'registrations' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Contact Primary</th>
                  <th className="py-3 px-4">Contact Secondary (FR-01)</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-right">Diagnosis Profile Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.fullName}</td>
                    <td className="py-3.5 px-4">{p.primaryPhone}</td>
                    <td className="py-3.5 px-4 text-slate-500">{p.secondaryPhone || 'None'}</td>
                    <td className="py-3.5 px-4">{p.age}y, {p.gender}</td>
                    <td className="py-3.5 px-4">{p.registrationDate}</td>
                    <td className="py-3.5 px-4 text-right font-semibold">
                      {p.diagnosisHistoryCompleted ? 'Profile Complete' : 'Pending Intake'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
