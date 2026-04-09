import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
window._db = db;

// ============================================================
// STEPPER SETUP
// ============================================================
const STEPS = [
    { label: "Identification", icon: "fa-id-card" },
    { label: "EP Reason & Admission", icon: "fa-hospital-user" },
    { label: "History & Exam", icon: "fa-heartbeat" },
    { label: "Home Meds", icon: "fa-pills" },
    { label: "Investigations", icon: "fa-microscope" },
    { label: "Procedure", icon: "fa-procedures" },
    { label: "Complications", icon: "fa-exclamation-triangle" },
    { label: "Outcome & D/C", icon: "fa-door-open" },
];
let currentStep = 0;

const stepperList = document.getElementById('stepperList');
STEPS.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'flex flex-col items-center cursor-pointer group';
    li.innerHTML = `<div id="sdot-${i}" class="step-dot ${i===0?'active':''}"><i class="fas ${s.icon} text-xs"></i></div><div id="slbl-${i}" class="step-label ${i===0?'active':''}">${s.label}</div>`;
    li.onclick = () => goToStep(i);
    stepperList.appendChild(li);
    if(i < STEPS.length-1) {
        const conn = document.createElement('li');
        conn.className = 'step-connector hidden md:block';
        stepperList.appendChild(conn);
    }
});

window.goToStep = function(idx) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`sdot-${currentStep}`).classList.remove('active');
    document.getElementById(`slbl-${currentStep}`).classList.remove('active');
    currentStep = idx;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.getElementById(`sdot-${currentStep}`).classList.add('active');
    document.getElementById(`slbl-${currentStep}`).classList.add('active');
    document.getElementById('btnPrev').classList.toggle('hidden', currentStep === 0);
    document.getElementById('btnNext').classList.toggle('hidden', currentStep === STEPS.length-1);
    document.getElementById('stepLabel').textContent = `Step ${currentStep+1} of ${STEPS.length}`;
    document.getElementById('progressFill').style.width = `${((currentStep+1)/STEPS.length)*100}%`;
    document.getElementById('formScrollArea').scrollTop = 0;
};
window.changeStep = function(dir) {
    const n = currentStep + dir;
    if(n>=0 && n<STEPS.length) goToStep(n);
};

// ============================================================
// NATIONALITY LIST
// ============================================================
const countries = [
    "Afghan","Albanian","Algerian","American","Andorran","Angolan","Antiguan","Argentine","Armenian","Australian","Austrian","Azerbaijani",
    "Bahamian","Bahraini","Bangladeshi","Barbadian","Belarusian","Belgian","Belizean","Beninese","Bhutanese","Bolivian","Bosnian","Botswanan","Brazilian","Bruneian","Bulgarian","Burkinabe","Burundian",
    "Cabo Verdean","Cambodian","Cameroonian","Canadian","Central African","Chadian","Chilean","Chinese","Colombian","Comoran","Congolese","Costa Rican","Croatian","Cuban","Cypriot","Czech",
    "Danish","Djiboutian","Dominican","Dutch",
    "East Timorese","Ecuadorean","Egyptian","Emirati","Equatorial Guinean","Eritrean","Estonian","Ethiopian",
    "Fijian","Filipino","Finnish","French",
    "Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Grenadian","Guatemalan","Guinean","Guyanese",
    "Haitian","Honduran","Hungarian",
    "Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli","Italian","Ivorian",
    "Jamaican","Japanese","Jordanian",
    "Kazakhstani","Kenyan","Korean","Kuwaiti","Kyrgyz",
    "Laotian","Latvian","Lebanese","Lesotho","Liberian","Libyan","Liechtensteiner","Lithuanian","Luxembourgish",
    "Macedonian","Malagasy","Malawian","Malaysian","Maldivian","Malian","Maltese","Mauritanian","Mauritian","Mexican","Micronesian","Moldovan","Monegasque","Mongolian","Montenegrin","Moroccan","Mozambican",
    "Namibian","Nepalese","New Zealander","Nicaraguan","Nigerian","Norwegian",
    "Omani",
    "Pakistani","Palauan","Panamanian","Papua New Guinean","Paraguayan","Peruvian","Polish","Portuguese",
    "Qatari",
    "Romanian","Russian","Rwandan",
    "Saint Lucian","Salvadoran","Samoan","Saudi Arabian","Senegalese","Serbian","Sierra Leonean","Singaporean","Slovak","Slovenian","Somali","South African","South Sudanese","Spanish","Sri Lankan","Sudanese","Surinamese","Swazi","Swedish","Swiss","Syrian",
    "Taiwanese","Tajik","Tanzanian","Thai","Togolese","Trinidadian","Tunisian","Turkish","Turkmen",
    "Ugandan","Ukrainian","Uruguayan","Uzbek",
    "Venezuelan","Vietnamese",
    "Yemeni",
    "Zambian","Zimbabwean",
    "Other"
];
document.getElementById('nationalitySelect').innerHTML = countries.map(c=>`<option value="${c}">${c}</option>`).join('');

// ============================================================
// SIMPLE RISK ITEMS (4.5–4.13)
// ============================================================
const simpleRiskItems = [
    {name:"hx_cad", label:"4.5 Coronary artery disease"},
    {name:"hx_mi", label:"4.6 Myocardial infarction"},
    {name:"hx_valve", label:"4.7 Valvular heart disease"},
    {name:"hx_cvd", label:"4.8 Cerebrovascular disease"},
    {name:"hx_lung", label:"4.9 Chronic lung disease"},
    {name:"hx_dialysis", label:"4.10 Currently on dialysis"},
    {name:"hx_dm", label:"4.11 Diabetes mellitus"},
    {name:"hx_htn", label:"4.12 Hypertension"},
    {name:"hx_familialSyndrome", label:"4.13 Familial syndrome – risk of sudden death"},
];
document.getElementById('simpleRiskGrid').innerHTML = simpleRiskItems.map(r=>`
<div>
    <label class="lbl">${r.label}</label>
    <select name="${r.name}" class="inp"><option value="No">No</option><option value="Yes">Yes</option></select>
</div>`).join('');

// ============================================================
// MEDICATIONS LISTS
// ============================================================
const medsList = [
    {name:"Amiodarone", field:"amiodarone"},
    {name:"Disopyramide", field:"disopyramide"},
    {name:"Flecainide", field:"flecainide"},
    {name:"Procainamide", field:"procainamide"},
    {name:"Propafenone", field:"propafenone"},
    {name:"Sotalol", field:"sotalol"},
    {name:"Verapamil", field:"verapamil"},
    {name:"Diltiazem", field:"diltiazem"},
    {name:"Warfarin", field:"warfarin"},
    {name:"Dabigatran", field:"dabigatran"},
    {name:"Apixaban", field:"apixaban"},
    {name:"Rivaroxaban", field:"rivaroxaban"},
    {name:"Edoxaban", field:"edoxaban"},
    {name:"LMWH", field:"lmwh"},
    {name:"Unfractionated Heparin", field:"ufheparin"},
    {name:"Aspirin", field:"aspirin"},
    {name:"Prasugrel", field:"prasugrel"},
    {name:"Clopidogrel", field:"clopidogrel"},
    {name:"Ticagrelor", field:"ticagrelor"},
    {name:"Cangrelor", field:"cangrelor"},
    {name:"ACE-I (Any)", field:"acei"},
    {name:"ARB (Any)", field:"arb"},
    {name:"ARNI", field:"arni"},
    {name:"SGLT inhibitor", field:"sglt"},
    {name:"Beta Blockers", field:"betablocker"},
    {name:"MRA", field:"mra"},
    {name:"Digoxin", field:"digoxin"},
    {name:"Loop diuretics", field:"loopdiuretic"},
];

const homeMedsGrid = document.getElementById('homeMedsGrid');
const dischargeMedsGrid = document.getElementById('dischargeMedsGrid');

medsList.forEach(m => {
    homeMedsGrid.innerHTML += `<label class="chk-item"><input type="checkbox" name="homeMed_${m.field}" class="w-4 h-4"> <span>${m.name}</span></label>`;
    dischargeMedsGrid.innerHTML += `<label class="chk-item"><input type="checkbox" name="dcMed_${m.field}" class="w-4 h-4"> <span>${m.name}</span></label>`;
});

// ============================================================
// CIVIL ID → AUTO AGE
// ============================================================
document.getElementById('civilId').addEventListener('input', function() {
    const v = this.value;
    if(v.length===12 && /^\d+$/.test(v)) {
        const cen = parseInt(v[0]);
        const yr = parseInt(v.substring(1,3));
        let year = cen===2 ? 1900+yr : cen===3 ? 2000+yr : 0;
        if(year > 0) {
            document.getElementById('yob').value = year;
            document.getElementById('estAge').value = new Date().getFullYear() - year;
        }
    } else {
        document.getElementById('yob').value='';
        document.getElementById('estAge').value='';
    }
});

// ============================================================
// YES/NO TOGGLE
// ============================================================
window.setYN = function(btn, key, val) {
    const group = btn.closest('.yn-group').querySelectorAll('.yn-btn');
    group.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('val_'+key).value = val;
    const sub = document.getElementById('sub_'+key);
    if(sub) {
        if(val==='Yes') sub.classList.add('show');
        else sub.classList.remove('show');
    }
};

// ============================================================
// EP REASON → SHOW PROCEDURE SECTIONS
// ============================================================
window.onEpReasonChange = function() {
    const val = document.querySelector('input[name="epReason"]:checked')?.value;
    const pmType = document.querySelector('input[name="pacemakerType"]:checked')?.value;

    document.getElementById('pmTypeDiv').classList.toggle('hidden', val !== 'Pacemaker');

    // Hide all proc sections and the no-reason banner
    document.querySelectorAll('.proc-section').forEach(s => s.classList.remove('show'));

    if(!val) {
        document.getElementById('proc_noReason').style.display = 'block';
        return;
    }

    document.getElementById('proc_noReason').style.display = 'none';

    if(val === 'CRT/AICD') {
        document.getElementById('proc_crtaicd').classList.add('show');

    } else if(val === 'Pacemaker') {
        // Only show sections once a pacemaker sub-type is picked
        if(!pmType) {
            // No sub-type yet — show the yellow banner again prompting sub-type selection
            document.getElementById('proc_noReason').style.display = 'block';
            document.getElementById('proc_noReason').querySelector('div:nth-child(2)').textContent = 'Please select the Pacemaker type (2.1) above to load the correct section.';
        } else if(pmType === 'Temporary pacemaker') {
            // Only 9.6
            document.getElementById('proc_temppm').classList.add('show');
        } else if(pmType === 'Permanent pacemaker') {
            // Only 9.7
            document.getElementById('proc_permpm').classList.add('show');
        } else if(pmType === 'Temporary followed by permanent same hospitalization') {
            // Both 9.6 and 9.7
            document.getElementById('proc_temppm').classList.add('show');
            document.getElementById('proc_permpm').classList.add('show');
        }

    } else if(val === 'EPS/Ablation') {
        document.getElementById('proc_eps').classList.add('show');

    } else if(val === 'LAAO') {
        document.getElementById('proc_laao').classList.add('show');
    }
};

// ============================================================
// PROCEDURE SECTION CONDITIONALS
// ============================================================
window.onCrtGenChange = function() {
    const val = document.querySelector('input[name="crtGenerator"]:checked')?.value;
    document.getElementById('crtGen_initial').classList.toggle('show', val==='Initial implant');
    document.getElementById('crtGen_replace').classList.toggle('show', val==='Generator replacement');
    document.getElementById('crtGen_explant').classList.toggle('show', val==='Generator explant');
};
window.onCrtDeviceType = function() {
    const val = document.querySelector('input[name="crtDeviceType"]:checked')?.value;
    document.getElementById('crtDualSub').classList.toggle('show', val==='CRT-D' || val==='ICD-Dual chamber');
};
window.onCrtPMType = function() {
    const val = document.querySelector('input[name="crtPMType"]:checked')?.value;
    document.getElementById('crtLBBBsub').classList.toggle('show', val==='LBBB PPM');
};
window.onCrtLead = function() {
    const val = document.querySelector('input[name="crtLead"]:checked')?.value;
    document.getElementById('crtLeadExistSub').classList.toggle('show', val==='Existing lead');
};
window.onPpmGenChange = function() {
    const val = document.querySelector('input[name="ppmGenerator"]:checked')?.value;
    document.getElementById('ppmGen_initial').classList.toggle('show', val==='Initial implant');
    document.getElementById('ppmGen_replace').classList.toggle('show', val==='Generator replacement');
    document.getElementById('ppmGen_explant').classList.toggle('show', val==='Generator explant');
};
window.onPpmDeviceType = function() {
    const val = document.querySelector('input[name="ppmDeviceType"]:checked')?.value;
    document.getElementById('ppmLBBBsub').classList.toggle('show', val==='LBBB PPM');
};
window.onPpmLead = function() {
    const val = document.querySelector('input[name="ppmLead"]:checked')?.value;
    document.getElementById('ppmLeadExistSub').classList.toggle('show', val==='Existing lead');
};
window.toggleTpmCause = function(divId) {
    setTimeout(() => {
        const drugChecked = document.getElementById('tpm_drugChk')?.checked;
        const miChecked = document.getElementById('tpm_miChk')?.checked;
        document.getElementById('drugDiv').classList.toggle('show', !!drugChecked);
        document.getElementById('miDiv').classList.toggle('show', !!miChecked);
    }, 0);
};
window.onCathManip = function() {
    const val = document.querySelector('input[name="epsCathManip"]:checked')?.value;
    document.getElementById('cathManipOther').classList.toggle('show', val==='Other');
};
window.onMappingSystem = function() {
    const val = document.querySelector('input[name="epsMappingSystem"]:checked')?.value;
    document.getElementById('mappingOther').classList.toggle('show', val==='Other');
};
window.onBleedType = function() {
    const val = document.querySelector('input[name="bleedType"]:checked')?.value;
    document.getElementById('bleedType3sub').classList.toggle('show', val==='Type 3');
};
window.onDischargeStatus = function() {
    const val = document.querySelector('input[name="dischargeStatus"]:checked')?.value;
    document.getElementById('dischDead').classList.toggle('show', val==='Dead');
    document.getElementById('dischAlive').classList.toggle('show', val==='Alive');
};

// CRT inherited sub
document.querySelector('input[name="crtInd_inherited"]')?.addEventListener('change', function() {
    document.getElementById('crtInheritedSub').classList.toggle('show', this.checked);
});

// ============================================================
// TABS
// ============================================================
window.switchTab = function(tab) {
    if(tab==='admin') {
        if(prompt('Enter Admin PIN:') !== '2468') { alert('Access Denied'); return; }
        fetchData();
    } else if(tab==='analytics') { fetchAnalytics(); }
    ['form','admin','analytics'].forEach(t => {
        document.getElementById(`section-${t}`).classList.add('hidden');
        document.getElementById(`tab-${t}`).className = 'pb-1 text-gray-500 hover:text-blue-700 text-sm font-medium transition';
    });
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).className = 'pb-1 tab-active text-sm transition';
};

// ============================================================
// SAVE FORM
// ============================================================
function resetFormUI(form) {
    form.reset();
    document.querySelectorAll('.sub-reveal').forEach(s => s.classList.remove('show'));
    document.querySelectorAll('.yn-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.yn-btn.yn-no').forEach(b => b.classList.add('selected'));
    document.querySelectorAll('input[type="hidden"][id^="val_"]').forEach(h => h.value = 'No');
    document.querySelectorAll('.proc-section').forEach(s => s.classList.remove('show'));
    document.getElementById('proc_noReason').style.display = 'block';
    goToStep(0);
}

document.getElementById('epsForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Mandatory validation
    const mandatory = [
        { id:'req_nameFirst', label:'Patient First Name' },
        { id:'req_nameLast',  label:'Patient Last Name' },
        { id:'civilId',       label:'Civil ID' },
        { id:'req_crfNo',     label:'CRF Number' },
        { id:'req_fileNo',    label:'File Number' },
    ];
    for(const f of mandatory) {
        const el = document.getElementById(f.id);
        if(!el || !el.value.trim()) {
            goToStep(0);
            el?.focus();
            el?.scrollIntoView({ behavior:'smooth', block:'center' });
            el.style.borderColor = '#dc2626';
            el.style.boxShadow = '0 0 0 3px rgba(220,38,38,.15)';
            setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 2500);
            alert(`Required field missing: "${f.label}"\nPlease fill all mandatory fields (*) before saving.`);
            return;
        }
    }
    if(!/^\d{12}$/.test(document.getElementById('civilId').value)) {
        goToStep(0); alert('Civil ID must be exactly 12 digits.'); return;
    }
    if(!/^\d{6}$/.test(document.getElementById('req_fileNo').value)) {
        goToStep(0); alert('File Number must be exactly 6 digits.'); return;
    }

    const fd = new FormData(e.target);
    const dataObj = Object.fromEntries(fd.entries());
    e.target.querySelectorAll('input[type="checkbox"]').forEach(cb => { dataObj[cb.name] = cb.checked; });
    e.target.querySelectorAll('input[type="radio"]:checked').forEach(r => { dataObj[r.name] = r.value; });
    dataObj.timestamp = new Date();
    const recordId = dataObj.recordId; delete dataObj.recordId;

    const btn = document.getElementById('btnSubmit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

    try {
        if(recordId) {
            await setDoc(doc(window._db,'patients_full',recordId), dataObj);
            alert('Record updated successfully!');
            document.getElementById('editModeBanner').classList.add('hidden');
        } else {
            await addDoc(collection(window._db,'patients_full'), dataObj);
            alert('New patient record saved!');
        }
        resetFormUI(e.target);
        loadRecordsCache();
    } catch(err) {
        console.error(err);
        alert('Save failed — check your connection.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save Record';
    }
});

// ============================================================
// ADMIN
// ============================================================
let allData = [];
window.fetchData = async function() {
    const sName  = document.getElementById('searchName').value.toLowerCase();
    const sCivil = document.getElementById('searchCivilId').value;
    const sFile  = document.getElementById('searchFileNo').value;
    const snapshot = await getDocs(collection(window._db,'patients_full'));
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML=''; allData=[];
    snapshot.forEach(docSnap => {
        const data = docSnap.data(); data.id = docSnap.id;
        const fullName = `${data.nameFirst||''} ${data.nameMiddle||''} ${data.nameLast||''}`.trim();
        if(sName  && !fullName.toLowerCase().includes(sName)) return;
        if(sCivil && !data.civilId?.includes(sCivil)) return;
        if(sFile  && !data.fileNumber?.includes(sFile)) return;
        data.fullName = fullName; allData.push(data);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="font-bold text-gray-800">${fullName||'Anonymous'}</div><div class="text-xs text-gray-500">${data.gender||''} | Age: ${data.estimatedAge||'?'}</div></td>
            <td class="text-xs"><div><span class="font-semibold text-gray-500">CID:</span> ${data.civilId||'—'}</div><div><span class="font-semibold text-gray-500">File:</span> ${data.fileNumber||'—'}</div></td>
            <td><span class="badge badge-blue">${data.epReason||'—'}</span></td>
            <td class="text-xs text-gray-600">${data.admissionDate||'—'}</td>
            <td class="text-right space-x-1">
                <button onclick='editRecord(${JSON.stringify(data).replace(/'/g,"\\'")} )' class="btn btn-yellow text-xs px-2 py-1"><i class="fas fa-edit"></i></button>
                <button onclick="deleteRecord('${data.id}')" class="btn btn-red text-xs px-2 py-1"><i class="fas fa-trash"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
    if(!allData.length) tbody.innerHTML='<tr><td colspan="5" class="text-center py-8 text-gray-400">No records found</td></tr>';
    _allRecordsCache = allData.slice();
};

window.deleteRecord = async function(id) {
    if(!confirm('Permanently delete this record?')) return;
    try {
        await deleteDoc(doc(window._db,'patients_full',id));
        fetchData();
    } catch(e) { alert('Delete failed.'); }
};

window.editRecord = function(data) {
    switchTab('form');
    document.getElementById('epsForm').reset();
    document.getElementById('editRecordId').value = data.id;
    document.getElementById('editModeBanner').classList.remove('hidden');
    Object.keys(data).forEach(key => {
        const el = document.getElementsByName(key)[0];
        if(!el) return;
        if(el.type==='checkbox') el.checked = !!data[key];
        else if(el.type==='radio') document.getElementsByName(key).forEach(r => { if(r.value===data[key]) r.checked=true; });
        else el.value = data[key]||'';
    });
    if(data.epReason) onEpReasonChange();
    goToStep(0);
};

// ============================================================
// EXPORT
// ============================================================
window.exportToExcel = function() {
    if(!allData.length) { alert('No data to export.'); return; }
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registry');
    XLSX.writeFile(wb, 'MKH_EP_Registry.xlsx');
};
window.exportToPDF = function() {
    if(!allData.length) { alert('No data to export.'); return; }
    const {jsPDF} = window.jspdf;
    const d = new jsPDF('landscape');
    d.text('Mubarak Alkabeer Hospital - EP Registry', 14, 15);
    d.autoTable({
        head:[['Name','Civil ID','File No.','Gender','Age','EP Reason','Admission','Discharge']],
        body:allData.map(r=>[r.fullName,r.civilId,r.fileNumber,r.gender,r.estimatedAge,r.epReason,r.admissionDate,r.dischargeStatus]),
        startY:22
    });
    d.save('MKH_Registry.pdf');
};

// ============================================================
// QUICK SEARCH (main screen live search)
// ============================================================
let _allRecordsCache = [];

async function loadRecordsCache() {
    const snapshot = await getDocs(collection(window._db,"patients_full"));
    _allRecordsCache = [];
    snapshot.forEach(docSnap => {
        const d = docSnap.data(); d.id = docSnap.id;
        d.fullName = `${d.nameFirst||''} ${d.nameMiddle||''} ${d.nameLast||''}`.trim();
        _allRecordsCache.push(d);
    });
}
loadRecordsCache();

window.quickSearch = function() {
    const q = document.getElementById('qs_input').value.trim();
    if(!q) { document.getElementById('qs_results').classList.add('hidden'); return; }

    const results = _allRecordsCache.filter(d =>
        (d.civilId||'').includes(q) ||
        (d.fileNumber||'').includes(q) ||
        (d.crfNo||'').includes(q)
    );

    const container = document.getElementById('qs_results');
    const list = document.getElementById('qs_list');
    document.getElementById('qs_count').textContent = `${results.length} found`;

    if(!results.length) {
        list.innerHTML = '<div class="px-4 py-6 text-center text-gray-400 text-sm">No matching records found</div>';
    } else {
        list.innerHTML = results.slice(0,8).map(d => `
            <div class="px-4 py-3 hover:bg-blue-50 cursor-pointer transition flex items-center justify-between gap-3"
                 onclick='editFromSearch(${JSON.stringify(d).replace(/'/g,"\\'")})'>
                <div>
                    <div class="font-bold text-gray-800 text-sm">${d.fullName || 'Anonymous'}</div>
                    <div class="text-xs text-gray-500 mt-0.5">
                        <span class="mr-3">CID: <span class="font-mono font-semibold">${d.civilId||'—'}</span></span>
                        <span class="mr-3">File: <span class="font-mono font-semibold">${d.fileNumber||'—'}</span></span>
                        <span>CRF: <span class="font-mono font-semibold">${d.crfNo||'—'}</span></span>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span class="badge badge-blue text-xs">${d.epReason||'—'}</span>
                    <button class="btn btn-yellow text-xs px-2 py-1" title="Edit"><i class="fas fa-edit"></i></button>
                </div>
            </div>
        `).join('');
    }
    container.classList.remove('hidden');
};

window.clearQuickSearch = function() {
    document.getElementById('qs_input').value = '';
    document.getElementById('qs_results').classList.add('hidden');
};

window.editFromSearch = function(data) {
    clearQuickSearch();
    editRecord(data);
};

// Close quick search on outside click
document.addEventListener('click', e => {
    if(!document.getElementById('mainSearchBar').contains(e.target)) {
        document.getElementById('qs_results').classList.add('hidden');
    }
});

// ============================================================
// ANALYTICS ACCORDION TOGGLE
// ============================================================
window.toggleAnalytic = function(key) {
    const body = document.getElementById('body_' + key);
    const chev = document.getElementById('chev_' + key);
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    chev.classList.toggle('open', !isOpen);
    // Resize chart inside if it exists
    if(!isOpen && charts[key+'Chart']) {
        setTimeout(() => charts[key+'Chart'].resize(), 50);
    }
};

// ============================================================
// ANALYTICS — Full rich dashboard from registry data
// ============================================================
let charts={};
function mkChart(id, type, labels, data, colors) {
    if(charts[id]) charts[id].destroy();
    const canvas = document.getElementById(id);
    if(!canvas) return;
    charts[id] = new Chart(canvas, {
        type,
        data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: type==='bar'?0:2, borderColor:'#fff' }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: type==='bar' ? 'top' : 'bottom',
                    labels: { font:{size:11}, boxWidth:12, padding:8 }
                }
            },
            scales: type==='bar' ? {
                y: { beginAtZero:true, ticks:{stepSize:1, font:{size:10}}, grid:{color:'#f1f5f9'} },
                x: { ticks:{font:{size:10}, maxRotation:35} }
            } : {}
        }
    });
}

window.fetchAnalytics = async function() {
    const snapshot = await getDocs(collection(window._db,"patients_full"));
    const rows = [];
    snapshot.forEach(docSnap => rows.push(docSnap.data()));

    const total = rows.length;
    if(!total) { alert('No data yet in registry.'); return; }

    // KPIs
    const successCount = rows.filter(r=>r.procSuccess==='Yes').length;
    const afibCount = rows.filter(r=>r.hx_afib==='Yes').length;
    const compCount = rows.filter(r=>
        r.cx_stroke==='Yes'||r.cx_bleeding==='Yes'||r.cx_tamponade2==='Yes'||
        r.cx_pneumothorax==='Yes'||r.cx_cardShock==='Yes'||r.cx_renal==='Yes'
    ).length;

    document.getElementById('kpi_total').textContent = total;
    document.getElementById('kpi_success').textContent = total ? `${Math.round(successCount/total*100)}%` : '—';
    document.getElementById('kpi_complications').textContent = total ? `${Math.round(compCount/total*100)}%` : '—';
    document.getElementById('kpi_afib').textContent = total ? `${Math.round(afibCount/total*100)}%` : '—';

    // Gender
    const m = rows.filter(r=>r.gender==='Male').length;
    const f = rows.filter(r=>r.gender==='Female').length;
    mkChart('genderChart','doughnut',['Male','Female'],[m,f],['#3b82f6','#ec4899']);

    // EP Reason
    const procCounts = {};
    rows.forEach(r=>{ if(r.epReason) procCounts[r.epReason]=(procCounts[r.epReason]||0)+1; });
    mkChart('procChart','pie',Object.keys(procCounts),Object.values(procCounts),
        ['#10b981','#6366f1','#f59e0b','#ef4444','#8b5cf6']);

    // Discharge
    const disch = {};
    rows.forEach(r=>{ if(r.dischargeStatus) disch[r.dischargeStatus]=(disch[r.dischargeStatus]||0)+1; });
    mkChart('dischargeChart','doughnut',Object.keys(disch),Object.values(disch),
        ['#22c55e','#3b82f6','#f97316','#ef4444','#94a3b8']);

    // Comorbidities
    const comorb = [
        { label:'AFib', val: rows.filter(r=>r.hx_afib==='Yes').length },
        { label:'HTN',  val: rows.filter(r=>r.hx_htn==='Yes').length },
        { label:'DM',   val: rows.filter(r=>r.hx_dm==='Yes').length },
        { label:'CAD',  val: rows.filter(r=>r.hx_cad==='Yes').length },
        { label:'HF',   val: rows.filter(r=>r.hx_hf==='Yes').length },
        { label:'Prior MI', val: rows.filter(r=>r.hx_mi==='Yes').length },
        { label:'CVD',  val: rows.filter(r=>r.hx_cvd==='Yes').length },
        { label:'Dialysis', val: rows.filter(r=>r.hx_dialysis==='Yes').length },
        { label:'Lung Dis.', val: rows.filter(r=>r.hx_lung==='Yes').length },
    ].sort((a,b)=>b.val-a.val);
    mkChart('comorbChart','bar',
        comorb.map(c=>c.label), comorb.map(c=>c.val),
        comorb.map((_,i)=>`hsl(${210+i*18},75%,55%)`));

    // Complications
    const comps = [
        { label:'Stroke',       val: rows.filter(r=>r.cx_stroke==='Yes').length },
        { label:'Bleeding',     val: rows.filter(r=>r.cx_bleeding==='Yes').length },
        { label:'Tamponade',    val: rows.filter(r=>r.cx_tamponade2==='Yes').length },
        { label:'Pneumothorax', val: rows.filter(r=>r.cx_pneumothorax==='Yes').length },
        { label:'Renal impair.', val: rows.filter(r=>r.cx_renal==='Yes').length },
        { label:'Card. Shock',  val: rows.filter(r=>r.cx_cardShock==='Yes').length },
        { label:'Vascular',     val: rows.filter(r=>r.cx_vascular==='Yes').length },
        { label:'Peri. effus.', val: rows.filter(r=>r.cx_periEff==='Yes').length },
    ].filter(c=>c.val>0).sort((a,b)=>b.val-a.val);
    mkChart('compChart','bar',
        comps.length ? comps.map(c=>c.label) : ['No complications recorded'],
        comps.length ? comps.map(c=>c.val) : [0],
        comps.map((_,i)=>`hsl(${0+i*22},75%,55%)`));

    // Prior CIED
    const ciedMap = {
        'Single PPM': rows.filter(r=>r.cied_single===true||r.cied_single==='true').length,
        'Dual PPM':   rows.filter(r=>r.cied_dual===true||r.cied_dual==='true').length,
        'CRT-D':      rows.filter(r=>r.cied_crtd===true||r.cied_crtd==='true').length,
        'ICD Single': rows.filter(r=>r.cied_icdSingle===true||r.cied_icdSingle==='true').length,
        'ICD Dual':   rows.filter(r=>r.cied_icdDual===true||r.cied_icdDual==='true').length,
        'S-ICD':      rows.filter(r=>r.cied_sicd===true||r.cied_sicd==='true').length,
        'CRT-P':      rows.filter(r=>r.cied_crtp===true||r.cied_crtp==='true').length,
    };
    const ciedFiltered = Object.entries(ciedMap).filter(([,v])=>v>0);
    mkChart('ciedChart','doughnut',
        ciedFiltered.length ? ciedFiltered.map(e=>e[0]) : ['No prior CIED data'],
        ciedFiltered.length ? ciedFiltered.map(e=>e[1]) : [1],
        ['#6366f1','#3b82f6','#ec4899','#f59e0b','#10b981','#ef4444','#8b5cf6']);

    // Top Medications
    const medFields = [
        {label:'Amiodarone',   field:'homeMed_amiodarone'},
        {label:'Beta Blocker', field:'homeMed_betablocker'},
        {label:'Aspirin',      field:'homeMed_aspirin'},
        {label:'Warfarin',     field:'homeMed_warfarin'},
        {label:'Apixaban',     field:'homeMed_apixaban'},
        {label:'Clopidogrel',  field:'homeMed_clopidogrel'},
        {label:'ACE-I',        field:'homeMed_acei'},
        {label:'Sotalol',      field:'homeMed_sotalol'},
        {label:'Digoxin',      field:'homeMed_digoxin'},
        {label:'Furosemide',   field:'homeMed_loopdiuretic'},
    ];
    const medsData = medFields.map(m=>({
        label: m.label,
        val: rows.filter(r=>r[m.field]===true||r[m.field]==='true').length
    })).sort((a,b)=>b.val-a.val);
    mkChart('medsChart','bar',
        medsData.map(m=>m.label), medsData.map(m=>m.val),
        medsData.map((_,i)=>`hsl(${140+i*15},65%,48%)`));

    // Refresh cache too
    await loadRecordsCache();
};
