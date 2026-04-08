<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EPS Registry - Mubarak Alkabeer Hospital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .tab-active { border-bottom: 2px solid #1d4ed8; color: #1d4ed8; font-weight: 600; }
        .hidden-section { display: none !important; }
        .step-active { background-color: #1d4ed8; color: white; border-color: #1d4ed8; }
        .step-inactive { background-color: white; color: #64748b; border-color: #cbd5e1; }
        .form-step { display: none; }
        .form-step.active { display: block; animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="text-gray-800">

    <header class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
                <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h4l2-4 4 8 2-4h6"></path>
                </svg>
                <div>
                    <h1 class="text-xl font-bold text-gray-900">Mubarak Alkabeer Hospital</h1>
                    <p class="text-sm text-gray-500">Comprehensive EP Registry</p>
                </div>
            </div>
            <nav class="flex gap-6">
                <button onclick="switchAppTab('form')" id="tab-form" class="pb-1 tab-active transition">Registry Form</button>
                <button onclick="switchAppTab('admin')" id="tab-admin" class="pb-1 text-gray-500 hover:text-blue-700 transition">Admin Panel</button>
                <button onclick="switchAppTab('analytics')" id="tab-analytics" class="pb-1 text-gray-500 hover:text-blue-700 transition">Analytics</button>
            </nav>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <section id="section-form" class="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row overflow-hidden">
            
            <div class="w-full md:w-64 bg-gray-50 p-6 border-r border-gray-200">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Form Progress</h3>
                <ul class="space-y-3" id="stepper">
                    </ul>
            </div>

            <div class="flex-1 p-8">
                <form id="epsForm" class="space-y-6">
                    
                    <div class="form-step active" id="step-1">
                        <h2 class="text-2xl font-bold text-blue-800 mb-6 border-b pb-2">1 & 3. Identification & Admission</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label class="block text-sm font-medium">Patient Name</label><input type="text" name="patientName" required class="w-full p-2 border rounded mt-1"></div>
                            <div><label class="block text-sm font-medium">Civil ID (12 Digits)</label><input type="text" name="civilId" id="civilId" inputmode="numeric" required class="w-full p-2 border rounded mt-1"></div>
                            <div><label class="block text-sm font-medium">CRF No (6 Digits)</label><input type="text" name="crfNo" id="crfNo" inputmode="numeric" required class="w-full p-2 border rounded mt-1"></div>
                            <div><label class="block text-sm font-medium">Gender</label><select name="gender" required class="w-full p-2 border rounded mt-1"><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                            <div><label class="block text-sm font-medium">Estimated Age / YOB</label><input type="number" name="age" class="w-full p-2 border rounded mt-1"></div>
                            <div><label class="block text-sm font-medium">Hospital Admission Date</label><input type="date" name="admissionDate" required class="w-full p-2 border rounded mt-1"></div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium">Reason for EP Lab</label>
                                <select name="epReason" class="w-full p-2 border rounded mt-1">
                                    <option value="">Select...</option>
                                    <option value="CRT/AICD">CRT/AICD with or without pacing</option>
                                    <option value="Pacemaker">Pacemaker</option>
                                    <option value="EPS/Ablation">EPS/Ablation</option>
                                    <option value="LAAO">Left Atrial Appendage Occlusion (LAAO)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-step" id="step-2">
                        <h2 class="text-2xl font-bold text-blue-800 mb-6 border-b pb-2">4 & 5. History & Examination</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded border">
                            <div><label class="block text-sm font-medium">Systolic BP</label><input type="number" name="sysBp" class="w-full p-2 border rounded mt-1"></div>
                            <div><label class="block text-sm font-medium">Diastolic BP</label><input type="number" name="diaBp" class="w-full p-2 border rounded mt-1"></div>
                            <div><label class="block text-sm font-medium">Presenting HR</label><input type="number" name="hr" class="w-full p-2 border rounded mt-1"></div>
                            <div><label class="block text-sm font-medium">Weight (kg)</label><input type="number" name="weight" class="w-full p-2 border rounded mt-1"></div>
                        </div>

                        <p class="text-sm text-gray-500 mb-2">Check all that apply for patient history:</p>
                        <div id="historyGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            </div>

                        <div class="mt-6 p-4 border rounded bg-blue-50">
                            <label class="block font-medium text-gray-800">4.25 Prior CV Implantable Electronic Device (CIED)</label>
                            <select name="ciedType" class="mt-2 w-full p-2 border rounded bg-white">
                                <option value="None">No Prior CIED</option>
                                <option value="Single chamber transvenous PPM">Single chamber transvenous PPM</option>
                                <option value="Dual chamber transvenous PPM">Dual chamber transvenous PPM</option>
                                <option value="CRT-P">CRT-P</option>
                                <option value="Leadless PPM">Leadless PPM</option>
                                <option value="ICD single/dual">ICD (Single/Dual)</option>
                                <option value="CRT-D">CRT-D</option>
                                <option value="S-ICD">S-ICD (Sub Q)</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-step" id="step-3">
                        <h2 class="text-2xl font-bold text-blue-800 mb-6 border-b pb-2">6 & 13. Medications</h2>
                        <p class="text-sm mb-4">Select medications used at Home (Admission) and/or Discharge.</p>
                        <div class="overflow-y-auto max-h-[500px] border rounded">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Medication</th>
                                        <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Home (Sec 6)</th>
                                        <th class="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Discharge (Sec 13)</th>
                                    </tr>
                                </thead>
                                <tbody id="medsTableBody" class="bg-white divide-y divide-gray-200">
                                    </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="form-step" id="step-4">
                        <h2 class="text-2xl font-bold text-blue-800 mb-6 border-b pb-2">7 & 8. Investigations & Labs</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-4 border rounded bg-gray-50">
                                <h3 class="font-bold mb-2">7.1 ECG & Echo</h3>
                                <label class="block text-sm">Rhythm</label>
                                <select name="ecgRhythm" class="w-full p-2 border rounded mt-1 mb-3"><option value="">Select...</option><option>Sinus</option><option>Atrial Fibrillation</option><option>Atrial Flutter</option><option>Heart Block</option></select>
                                <label class="block text-sm">LVEF (%)</label>
                                <input type="number" name="lvef" class="w-full p-2 border rounded mt-1">
                            </div>
                            <div class="p-4 border rounded bg-gray-50">
                                <h3 class="font-bold mb-2">8. Laboratory</h3>
                                <div class="grid grid-cols-2 gap-2">
                                    <div><label class="text-xs">Creatinine Initial</label><input type="number" name="creatInit" class="w-full p-1 border rounded"></div>
                                    <div><label class="text-xs">Creatinine Peak</label><input type="number" name="creatPeak" class="w-full p-1 border rounded"></div>
                                    <div><label class="text-xs">Hemoglobin</label><input type="number" name="hgb" class="w-full p-1 border rounded"></div>
                                    <div><label class="text-xs">INR</label><input type="number" step="0.1" name="inr" class="w-full p-1 border rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-step" id="step-5">
                        <h2 class="text-2xl font-bold text-blue-800 mb-6 border-b pb-2">9 & 10. Procedure & Complications</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div><label class="block text-sm font-medium">Procedure Start Date/Time</label><input type="datetime-local" name="procStart" class="w-full p-2 border rounded mt-1"></div>
                            <div><label class="block text-sm font-medium">Operator Name</label><input type="text" name="operator" class="w-full p-2 border rounded mt-1"></div>
                        </div>
                        <div class="p-4 border rounded border-red-200 bg-red-50">
                            <h3 class="font-bold text-red-800 mb-2">10.2 Complications during stay</h3>
                            <div id="compsGrid" class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                </div>
                        </div>
                    </div>

                    <div class="form-step" id="step-6">
                        <h2 class="text-2xl font-bold text-blue-800 mb-6 border-b pb-2">11 & 12. Outcomes & Discharge</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="block font-medium">11.1 Immediate Procedure Success?</label>
                                <select name="procSuccess" class="w-full md:w-1/2 p-2 border rounded mt-1"><option value="">Select...</option><option>Yes</option><option>No</option></select>
                            </div>
                            <div>
                                <label class="block font-medium">12.1 Date of Discharge/Death</label>
                                <input type="date" name="dischargeDate" class="w-full md:w-1/2 p-2 border rounded mt-1">
                            </div>
                            <div>
                                <label class="block font-medium">12.3 Discharge Status</label>
                                <select name="dischargeStatus" class="w-full md:w-1/2 p-2 border rounded mt-1"><option value="">Select...</option><option>Alive - Home</option><option>Alive - Transfer</option><option>Dead - Cardiac</option><option>Dead - Non-Cardiac</option></select>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between pt-6 border-t mt-8">
                        <button type="button" id="btnPrev" onclick="changeStep(-1)" class="hidden bg-gray-200 text-gray-700 px-6 py-2 rounded shadow hover:bg-gray-300">Previous</button>
                        <button type="button" id="btnNext" onclick="changeStep(1)" class="ml-auto bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">Next Step</button>
                        <button type="submit" id="btnSubmit" class="hidden ml-auto bg-green-600 text-white font-bold px-8 py-2 rounded shadow hover:bg-green-700"><i class="fas fa-save mr-2"></i> Save Entire Record</button>
                    </div>
                </form>
            </div>
        </section>

        <section id="section-admin" class="hidden-section bg-white rounded-xl shadow-lg p-8 border border-gray-100">
             <div class="flex justify-between items-center mb-6 border-b pb-4">
                <h2 class="text-2xl font-bold text-blue-800"><i class="fas fa-database mr-2"></i> Admin Panel</h2>
                <div class="flex gap-3">
                    <button onclick="exportToExcel()" class="bg-green-600 text-white px-4 py-2 rounded shadow"><i class="fas fa-file-excel mr-2"></i> Export Excel</button>
                </div>
            </div>
            <div class="bg-gray-50 p-4 rounded mb-6 flex gap-4">
                <input type="text" id="searchName" placeholder="Name" class="p-2 border rounded flex-1">
                <input type="text" id="searchCivilId" placeholder="Civil ID" class="p-2 border rounded flex-1">
                <button onclick="fetchData()" class="bg-blue-600 text-white px-6 py-2 rounded"><i class="fas fa-search"></i></button>
            </div>
            <table class="min-w-full divide-y divide-gray-200 border">
                <thead class="bg-gray-50"><tr><th class="p-3 text-left">Name</th><th class="p-3 text-left">Civil ID</th><th class="p-3 text-left">CRF</th><th class="p-3 text-left">CIED Status</th><th class="p-3 text-left">Actions</th></tr></thead>
                <tbody id="tableBody" class="bg-white divide-y"></tbody>
            </table>
        </section>

        <section id="section-analytics" class="hidden-section bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 class="text-2xl font-bold mb-6 border-b pb-2 text-blue-800"><i class="fas fa-chart-pie mr-2"></i> Study Analytics</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <canvas id="genderChart"></canvas>
                <canvas id="ciedChart"></canvas>
            </div>
        </section>

    </main>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBocWe4k3ljikv2D2a_f7RDlPRnAaH6Zxs",
            authDomain: "eps-registry-mkh.firebaseapp.com",
            projectId: "eps-registry-mkh",
            storageBucket: "eps-registry-mkh.firebasestorage.app",
            messagingSenderId: "893225906696",
            appId: "1:893225906696:web:d4c4324b4d9e3edecc57bd"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // --- Data Generation for Forms (Derived from your Word Doc) ---
        const historyItems = ["Atrial fibrillation", "Cardiac arrest", "Cardiomyopathy", "Heart failure", "Coronary artery disease", "Myocardial infarction", "Valvular heart disease", "Cerebrovascular disease", "Chronic lung disease", "Currently on dialysis", "Diabetes mellitus", "Hypertension", "Syncope"];
        const compItems = ["Resuscitated cardiac arrest", "Pulmonary edema/CHF", "Cardiac tamponade", "Stroke", "Bleeding/Hematoma", "Pericarditis", "Cardiogenic shock", "Mechanical complication"];
        const medsList = ["Amiodarone", "Disopyramide", "Flecainide", "Procainamide", "Propafenone", "Sotalol", "Verapamil", "Diltiazem", "Warfarin", "Dabigatran", "Apixaban", "Rivaroxaban", "Edoxaban", "Heparin (LMWH/UFH)", "Aspirin", "Clopidogrel", "Ticagrelor", "ACE-I/ARB", "Beta Blockers", "MRA", "Loop diuretics"];

        // Inject History checkboxes
        document.getElementById('historyGrid').innerHTML = historyItems.map(h => 
            `<label class="flex items-center space-x-2"><input type="checkbox" name="hx_${h.replace(/\s+/g, '')}" class="rounded text-blue-600"> <span>${h}</span></label>`
        ).join('');

        // Inject Complications checkboxes
        document.getElementById('compsGrid').innerHTML = compItems.map(c => 
            `<label class="flex items-center space-x-2"><input type="checkbox" name="comp_${c.replace(/\W+/g, '')}" class="rounded text-red-600"> <span class="text-sm">${c}</span></label>`
        ).join('');

        // Inject Medications table
        document.getElementById('medsTableBody').innerHTML = medsList.map((m, i) => `
            <tr>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${i+1}. ${m}</td>
                <td class="px-4 py-2 text-center"><input type="checkbox" name="medHome_${i}" value="${m}" class="w-4 h-4 text-blue-600"></td>
                <td class="px-4 py-2 text-center"><input type="checkbox" name="medDischarge_${i}" value="${m}" class="w-4 h-4 text-green-600"></td>
            </tr>
        `).join('');

        // --- Multi-Step Form Logic ---
        const steps = ["Identification", "History & Exam", "Medications", "Investigations", "Procedure", "Outcomes"];
        let currentStep = 0;

        const stepperEl = document.getElementById('stepper');
        stepperEl.innerHTML = steps.map((s, i) => `
            <li class="flex items-center gap-3">
                <div id="step-icon-${i}" class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i===0?'step-active':'step-inactive'}">${i+1}</div>
                <span id="step-text-${i}" class="text-sm ${i===0?'font-bold text-gray-900':'text-gray-500'}">${s}</span>
            </li>
        `).join('');

        window.changeStep = function(direction) {
            const formSteps = document.querySelectorAll('.form-step');
            
            // Custom Validation before leaving step 1
            if (direction === 1 && currentStep === 0) {
                const cid = document.getElementById('civilId').value;
                const crf = document.getElementById('crfNo').value;
                if(!/^\d{12}$/.test(cid)) return alert("Civil ID must be exactly 12 numbers.");
                if(!/^\d{6}$/.test(crf)) return alert("CRF Number must be exactly 6 numbers.");
            }

            formSteps[currentStep].classList.remove('active');
            document.getElementById(`step-icon-${currentStep}`).classList.remove('step-active');
            document.getElementById(`step-icon-${currentStep}`).classList.add('step-inactive');
            document.getElementById(`step-text-${currentStep}`).classList.remove('font-bold', 'text-gray-900');

            currentStep += direction;

            formSteps[currentStep].classList.add('active');
            document.getElementById(`step-icon-${currentStep}`).classList.remove('step-inactive');
            document.getElementById(`step-icon-${currentStep}`).classList.add('step-active');
            document.getElementById(`step-text-${currentStep}`).classList.add('font-bold', 'text-gray-900');

            document.getElementById('btnPrev').style.display = currentStep === 0 ? 'none' : 'block';
            
            if (currentStep === formSteps.length - 1) {
                document.getElementById('btnNext').style.display = 'none';
                document.getElementById('btnSubmit').style.display = 'block';
            } else {
                document.getElementById('btnNext').style.display = 'block';
                document.getElementById('btnSubmit').style.display = 'none';
            }
        };

        // --- Tab Navigation ---
        window.switchAppTab = function(tabName) {
            if(tabName === 'admin') {
                if(prompt("Enter Admin PIN:") !== "2468") return alert("Access Denied");
                fetchData();
            } else if (tabName === 'analytics') {
                fetchAnalytics();
            }
            ['form', 'admin', 'analytics'].forEach(t => {
                document.getElementById(`section-${t}`).classList.add('hidden-section');
                document.getElementById(`tab-${t}`).className = 'pb-1 text-gray-500 hover:text-blue-700 transition';
            });
            document.getElementById(`section-${tabName}`).classList.remove('hidden-section');
            document.getElementById(`tab-${tabName}`).className = 'pb-1 tab-active transition';
        };

        // --- Save Form (Smart JSON Serialization) ---
        document.getElementById('epsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Smart way to get all inputs (text, checkboxes, selects)
            const formData = new FormData(e.target);
            const dataObj = Object.fromEntries(formData.entries());
            
            // Handle checkboxes which FormData doesn't include if unchecked
            e.target.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                dataObj[cb.name] = cb.checked;
            });
            dataObj.timestamp = new Date();

            try {
                await addDoc(collection(db, "patients_full"), dataObj);
                alert("Success: Patient full record saved to Firebase!");
                e.target.reset();
                currentStep = 0; changeStep(0); // Reset UI to start
            } catch (error) {
                console.error(error); alert("Error saving data.");
            }
        });

        // --- Admin & Analytics (Abridged for spacing, keeps core functionality) ---
        let allData = [];
        window.fetchData = async function() {
            const sName = document.getElementById('searchName').value.toLowerCase();
            const sCivil = document.getElementById('searchCivilId').value;
            const snapshot = await getDocs(collection(db, "patients_full"));
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = ''; allData = [];

            snapshot.forEach((docSnap) => {
                const data = docSnap.data(); data.id = docSnap.id;
                if(sName && !data.patientName?.toLowerCase().includes(sName)) return;
                if(sCivil && !data.civilId?.includes(sCivil)) return;
                allData.push(data);
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-3">${data.patientName || 'N/A'}</td><td class="p-3">${data.civilId || 'N/A'}</td>
                    <td class="p-3">${data.crfNo || 'N/A'}</td><td class="p-3">${data.ciedType || 'None'}</td>
                    <td class="p-3"><button onclick="deleteRecord('${data.id}')" class="text-red-600"><i class="fas fa-trash"></i></button></td>
                `;
                tbody.appendChild(tr);
            });
        };

        window.deleteRecord = async function(id) {
            if(confirm("Delete record?")) { await deleteDoc(doc(db, "patients_full", id)); fetchData(); }
        };

        window.exportToExcel = function() {
            if(!allData.length) return alert("No data");
            const ws = XLSX.utils.json_to_sheet(allData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Registry");
            XLSX.writeFile(wb, "Full_EPS_Registry.xlsx");
        };

        let chart1, chart2;
        window.fetchAnalytics = async function() {
            const snapshot = await getDocs(collection(db, "patients_full"));
            let m=0, f=0, ciedY=0, ciedN=0;
            snapshot.forEach(doc => {
                const d = doc.data();
                d.gender === 'Male' ? m++ : f++;
                d.ciedType !== 'None' ? ciedY++ : ciedN++;
            });
            
            if(chart1) chart1.destroy(); if(chart2) chart2.destroy();
            chart1 = new Chart(document.getElementById('genderChart'), { type: 'pie', data: { labels: ['Male', 'Female'], datasets: [{data: [m, f], backgroundColor: ['#3b82f6', '#ec4899']}] }});
            chart2 = new Chart(document.getElementById('ciedChart'), { type: 'doughnut', data: { labels: ['Has CIED', 'No CIED'], datasets: [{data: [ciedY, ciedN], backgroundColor: ['#10b981', '#f59e0b']}] }});
        };
    </script>
</body>
</html>
