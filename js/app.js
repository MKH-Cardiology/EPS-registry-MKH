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

document.addEventListener('DOMContentLoaded', () => {
    const stepperList = document.getElementById('stepperList');
    if(stepperList) {
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
    }

    // ============================================================
    // NATIONALITY LIST
    // ============================================================
    const countries = [
        "Afghan","Albanian","Algerian","American","Andorran","Angolan","Antiguan","Argentine","Armenian","Australian","Austrian","Azerbaijani",
        "Bahamian","Bahraini","Bangladeshi","Barbadian","Belarusian","Belgian","Belizean","Beninese","Bhutanese","Bolivian","Bosnian","Botswanan","Brazilian","Bruneian","Bulgarian","Burkinabe","Burundian",
        "Cabo Verdean","Cambodian","Cameroonian","Canadian","Central African","Chadian","Chilean","Chinese","Colombian","Comoran","Congolese","Costa Rican","Croatian","Cuban","Cypriot","Czech",
        "Danish","Djiboutian","Dominican","Dutch","East Timorese","Ecuadorean","Egyptian","Emirati","Equatorial Guinean","Eritrean","Estonian","Ethiopian",
        "Fijian","Filipino","Finnish","French","Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Grenadian","Guatemalan","Guinean","Guyanese",
        "Haitian","Honduran","Hungarian","Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli","Italian","Ivorian",
        "Jamaican","Japanese","Jordanian","Kazakhstani","Kenyan","Korean","Kuwaiti","Kyrgyz",
        "Laotian","Latvian","Lebanese","Lesotho","Liberian","Libyan","Liechtensteiner","Lithuanian","Luxembourgish",
        "Macedonian","Malagasy","Malawian","Malaysian","Maldivian","Malian","Maltese","Mauritanian","Mauritian","Mexican","Micronesian","Moldovan","Monegasque","Mongolian","Montenegrin","Moroccan","Mozambican",
        "Namibian","Nepalese","New Zealander","Nicaraguan","Nigerian","Norwegian","Omani",
        "Pakistani","Palauan","Panamanian","Papua New Guinean","Paraguayan","Peruvian","Polish","Portuguese","Qatari",
        "Romanian","Russian","Rwandan","Saint Lucian","Salvadoran","Samoan","Saudi Arabian","Senegalese","Serbian","Sierra Leonean","Singaporean","Slovak","Slovenian","Somali","South African","South Sudanese","Spanish","Sri Lankan","Sudanese","Surinamese","Swazi","Swedish","Swiss","Syrian",
        "Taiwanese","Tajik","Tanzanian","Thai","Togolese","Trinidadian","Tunisian","Turkish","Turkmen",
        "Ugandan","Ukrainian","Uruguayan","Uzbek","Venezuelan","Vietnamese","Yemeni","Zambian","Zimbabwean","Other"
    ];
    const natSelect = document.getElementById('nationalitySelect');
    if(natSelect) natSelect.innerHTML = countries.map(c=>`<option value="${c}">${c}</option>`).join('');

    // ============================================================
    // SIMPLE RISK ITEMS (4.5-4.13)
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
    const riskGrid = document.getElementById('simpleRiskGrid');
    if(riskGrid) riskGrid.innerHTML = simpleRiskItems.map(r=>`
    <div>
        <label class="lbl">${r.label}</label>
        <select name="${r.name}" class="inp"><option value="No">No</option><option value="Yes">Yes</option></select>
    </div>`).join('');

    // ============================================================
    // MEDICATIONS LISTS
    // ============================================================
    const medsList = [
        {name:"Amiodarone",field:"amiodarone"},{name:"Disopyramide",field:"disopyramide"},
        {name:"Flecainide",field:"flecainide"},{name:"Procainamide",field:"procainamide"},
        {name:"Propafenone",field:"propafenone"},{name:"Sotalol",field:"sotalol"},
        {name:"Verapamil",field:"verapamil"},{name:"Diltiazem",field:"diltiazem"},
        {name:"Warfarin",field:"warfarin"},{name:"Dabigatran",field:"dabigatran"},
        {name:"Apixaban",field:"apixaban"},{name:"Rivaroxaban",field:"rivaroxaban"},
        {name:"Edoxaban",field:"edoxaban"},{name:"LMWH",field:"lmwh"},
        {name:"Unfractionated Heparin",field:"ufheparin"},{name:"Aspirin",field:"aspirin"},
        {name:"Prasugrel",field:"prasugrel"},{name:"Clopidogrel",field:"clopidogrel"},
        {name:"Ticagrelor",field:"ticagrelor"},{name:"Cangrelor",field:"cangrelor"},
        {name:"ACE-I (Any)",field:"acei"},{name:"ARB (Any)",field:"arb"},
        {name:"ARNI",field:"arni"},{name:"SGLT inhibitor",field:"sglt"},
        {name:"Beta Blockers",field:"betablocker"},{name:"MRA",field:"mra"},
        {name:"Digoxin",field:"digoxin"},{name:"Loop diuretics",field:"loopdiuretic"},
    ];
    const homeMedsGrid = document.getElementById('homeMedsGrid');
    const dischargeMedsGrid = document.getElementById('dischargeMedsGrid');
    if(homeMedsGrid && dischargeMedsGrid) {
        medsList.forEach(m => {
            homeMedsGrid.innerHTML += `<label class="chk-item"><input type="checkbox" name="homeMed_${m.field}" class="w-4 h-4"> <span>${m.name}</span></label>`;
            dischargeMedsGrid.innerHTML += `<label class="chk-item"><input type="checkbox" name="dcMed_${m.field}" class="w-4 h-4"> <span>${m.name}</span></label>`;
        });
    }

    // Event Listeners setup
    setupEventListeners();
    
    // Initial Load
    loadRecordsCache();
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

window.setYN = function(btn, key, val) {
    const group = btn.closest('.yn-group').querySelectorAll('.yn-btn');
    group.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('val_'+key).value = val;
    const sub = document.getElementById('sub_'+key);
    if(sub) { if(val==='Yes') sub.classList.add('show'); else sub.classList.remove('show'); }
};

window.onEpReasonChange = function() {
    const val = document.querySelector('input[name="epReason"]:checked')?.value;
    const pmType = document.querySelector('input[name="pacemakerType"]:checked')?.value;
    document.getElementById('pmTypeDiv').classList.toggle('hidden', val !== 'Pacemaker');
    document.querySelectorAll('.proc-section').forEach(s => s.classList.remove('show'));
    if(!val) { document.getElementById('proc_noReason').style.display='block'; return; }
    document.getElementById('proc_noReason').style.display='none';
    if(val==='CRT/AICD') {
        document.getElementById('proc_crtaicd').classList.add('show');
    } else if(val==='Pacemaker') {
        if(!pmType) { document.getElementById('proc_noReason').style.display='block'; }
        else if(pmType==='Temporary pacemaker') { document.getElementById('proc_temppm').classList.add('show'); }
        else if(pmType==='Permanent pacemaker') { document.getElementById('proc_permpm').classList.add('show'); }
        else if(pmType==='Temporary followed by permanent same hospitalization') {
            document.getElementById('proc_temppm').classList.add('show');
            document.getElementById('proc_permpm').classList.add('show');
        }
    } else if(val==='EPS/Ablation') {
        document.getElementById('proc_eps').classList.add('show');
    } else if(val==='LAAO') {
        document.getElementById('proc_laao').classList.add('show');
    }
};

window.onCrtGenChange = function() {
    const val = document.querySelector('input[name="crtGenerator"]:checked')?.value;
    document.getElementById('crtGen_initial').classList.toggle('show', val==='Initial implant');
    document.getElementById('crtGen_replace').classList.toggle('show', val==='Generator replacement');
    document.getElementById('crtGen_explant').classList.toggle('show', val==='Generator explant');
};
window.onCrtDeviceType = function() {
    const val = document.querySelector('input[name="crtDeviceType"]:checked')?.value;
    document.getElementById('crtDualSub').classList.toggle('show', val==='CRT-D'||val==='ICD-Dual chamber');
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
window.toggleTpmCause = function() {
    setTimeout(() => {
        document.getElementById('drugDiv').classList.toggle('show', !!document.getElementById('tpm_drugChk')?.checked);
        document.getElementById('miDiv').classList.toggle('show', !!document.getElementById('tpm_miChk')?.checked);
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

function showWarning(el, msg) {
    el.style.borderColor='#f59e0b'; el.style.boxShadow='0 0 0 3px rgba(245,158,11,.15)';
    let tip=el.parentNode.querySelector('.val-tip');
    if(!tip){tip=document.createElement('div');tip.className='val-tip';tip.style.cssText='font-size:11px;color:#b45309;font-weight:600;margin-top:3px;';el.parentNode.appendChild(tip);}
    tip.textContent='⚠ '+msg;
}
function showError(el, msg) {
    el.style.borderColor='#dc2626'; el.style.boxShadow='0 0 0 3px rgba(220,38,38,.15)';
    let tip=el.parentNode.querySelector('.val-tip');
    if(!tip){tip=document.createElement('div');tip.className='val-tip';tip.style.cssText='font-size:11px;color:#dc2626;font-weight:600;margin-top:3px;';el.parentNode.appendChild(tip);}
    tip.textContent='✖ '+msg;
}
function clearValidation(el) {
    el.style.borderColor=''; el.style.boxShadow='';
    el.parentNode.querySelector('.val-tip')?.remove();
}
function attachRangeValidation(name, min, max, unit='', warnOnly=false) {
    const el=document.querySelector(`[name="${name}"]`); if(!el) return;
    el.addEventListener('blur', function() {
        if(!this.value){clearValidation(this);return;}
        const v=parseFloat(this.value); if(isNaN(v)) return;
        if(v<min||v>max) { warnOnly?showWarning(this,`Expected ${min}–${max}${unit?' '+unit:''}`) : showError(this,`Expected ${min}–${max}${unit?' '+unit:''}`); }
        else clearValidation(this);
    });
}

function checkYobAgeConsistency(){
    const yob=parseInt(document.getElementById('yob')?.value), age=parseInt(document.getElementById('estAge')?.value);
    if(yob&&age){const calc=new Date().getFullYear()-yob; if(Math.abs(calc-age)>2) showWarning(document.getElementById('estAge'),`Age (${age}) doesn't match YOB ${yob} — expected ~${calc}`); else clearValidation(document.getElementById('estAge'));}
}

function checkAfibLaao(){
    const afib=document.getElementById('val_afib')?.value;
    const reason=document.querySelector('input[name="epReason"]:checked')?.value;
    let b=document.getElementById('laao_afib_warn');
    if(afib==='No'&&reason==='LAAO'){
        if(!b){b=document.createElement('div');b.id='laao_afib_warn';b.style.cssText='background:#fee2e2;border:1.5px solid #fca5a5;border-radius:8px;padding:10px 14px;margin-top:8px;font-size:12px;color:#b91c1c;font-weight:600;';
        b.innerHTML='⚠ AFib marked No but LAAO selected. Please verify.';
        document.getElementById('proc_laao')?.insertAdjacentElement('afterbegin',b);}
    } else b?.remove();
}

function setupEventListeners() {
    attachRangeValidation('sysBp',50,300,'mmHg'); attachRangeValidation('diaBp',20,200,'mmHg');
    attachRangeValidation('hr',20,300,'/min'); attachRangeValidation('weight',1,300,'kg');
    attachRangeValidation('height',50,250,'cm'); attachRangeValidation('creatInit',10,3000,'µmol/L');
    attachRangeValidation('creatPeak',10,3000,'µmol/L'); attachRangeValidation('hgbInit',1,25,'g/dL');
    attachRangeValidation('hgbLowest',1,25,'g/dL'); attachRangeValidation('sodium',100,170,'mEq/L');
    attachRangeValidation('potassium',1.5,9,'mEq/L'); attachRangeValidation('magnesium',0.3,3,'mEq/L');
    attachRangeValidation('inr',0.5,15); attachRangeValidation('lvesd',1,100,'mm');
    attachRangeValidation('lvedd',1,100,'mm'); attachRangeValidation('rvsp',5,150,'mmHg');
    attachRangeValidation('laaOstial',5,50,'mm'); attachRangeValidation('laaDepth',5,50,'mm');
    attachRangeValidation('ecgQRS',60,800,'msec'); attachRangeValidation('crtLBBBqrs',60,800,'msec');
    attachRangeValidation('ppmLBBBqrs',60,800,'msec'); attachRangeValidation('cspQRS',60,800,'msec');
    attachRangeValidation('epsAblTime',1,600,'min'); attachRangeValidation('epsFluoroTime',0,300,'min');
    attachRangeValidation('transfusionUnits',1,50,'units');
    attachRangeValidation('yob',1900,new Date().getFullYear(),'');
    attachRangeValidation('estimatedAge',0,120,'yrs');

    document.getElementById('civilId')?.addEventListener('input', function() {
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

    const lvefEl=document.querySelector('[name="lvef"]');
    if(lvefEl) lvefEl.addEventListener('blur',function(){
        if(!this.value){clearValidation(this);return;} const v=parseFloat(this.value);
        if(v<5||v>85) showError(this,'Expected 5–85%');
        else if(v<10||v>80) showWarning(this,`LVEF ${v}% — unusual, please confirm`);
        else clearValidation(this);

        if(!isNaN(v)&&v<=35){
            const ic=document.querySelector('[name="crtInd_icmEF"]'),ni=document.querySelector('[name="crtInd_nicmEF"]');
            if(ic&&!ic.checked&&!ni?.checked){
                let b=document.getElementById('lvef_suggest');
                if(!b){b=document.createElement('div');b.id='lvef_suggest';b.style.cssText='background:#fef9c3;border:1.5px solid #fde047;border-radius:8px;padding:10px 14px;margin-top:10px;font-size:12px;color:#a16207;font-weight:600;';
                b.innerHTML='💡 LVEF ≤ 35% — consider checking ICM or Non-ICM with EF ≤ 35% in Section 9.5a.';
                (this.closest('.sub-reveal')||this.parentNode).appendChild(b);}
            }
        } else document.getElementById('lvef_suggest')?.remove();
    });

    const sysBpEl=document.querySelector('[name="sysBp"]'), diaBpEl=document.querySelector('[name="diaBp"]');
    function checkBP() {
        const s=parseFloat(sysBpEl?.value), d=parseFloat(diaBpEl?.value);
        if(s&&d){if(s<=d){showError(sysBpEl,'Systolic must be > Diastolic');showError(diaBpEl,'Diastolic must be < Systolic');}else{clearValidation(sysBpEl);clearValidation(diaBpEl);}}
    }
    sysBpEl?.addEventListener('blur',checkBP); diaBpEl?.addEventListener('blur',checkBP);

    document.querySelector('[name="dischargeDate"]')?.addEventListener('change',function(){
        const adm=document.getElementById('req_admDate')?.value;
        if(adm&&this.value&&this.value<adm) showError(this,'Cannot be before admission date'); else clearValidation(this);
    });
    document.querySelector('[name="procStartDate"]')?.addEventListener('change',function(){
        const adm=document.getElementById('req_admDate')?.value;
        if(adm&&this.value&&this.value<adm) showError(this,'Cannot be before admission date'); else clearValidation(this);
    });
    document.querySelector('[name="procEndTime"]')?.addEventListener('change',function(){
        const start=document.querySelector('[name="procStartTime"]')?.value;
        if(start&&this.value&&this.value<=start) showWarning(this,'Should be after start time'); else clearValidation(this);
    });
    document.getElementById('civilId')?.addEventListener('blur',function(){
        const v=this.value;
        if(v.length===12&&/^\d{12}$/.test(v)){const c=parseInt(v[0]);if(c!==2&&c!==3) showError(this,'Must start with 2 or 3'); else clearValidation(this);}
    });

    document.getElementById('yob')?.addEventListener('blur',checkYobAgeConsistency);
    document.getElementById('estAge')?.addEventListener('blur',checkYobAgeConsistency);

    const cardArrestObs=new MutationObserver(()=>{
        const val=document.getElementById('val_cardArrest')?.value;
        const survBox=document.querySelector('[name="crtInd_surv"]');
        if(val==='Yes'&&survBox&&!survBox.checked){
            let b=document.getElementById('arrest_suggest');
            if(!b){b=document.createElement('div');b.id='arrest_suggest';b.style.cssText='background:#fef9c3;border:1.5px solid #fde047;border-radius:8px;padding:8px 12px;margin-top:6px;font-size:12px;color:#a16207;font-weight:600;';
            b.innerHTML='💡 Cardiac Arrest recorded — consider checking Survivors indication in Section 9.5a.';
            document.getElementById('sub_cardArrest')?.appendChild(b);}
        } else document.getElementById('arrest_suggest')?.remove();
    });
    const cardArrestHidden=document.getElementById('val_cardArrest');
    if(cardArrestHidden) cardArrestObs.observe(cardArrestHidden,{attributes:true,attributeFilter:['value']});

    document.querySelectorAll('input[name="epReason"]').forEach(r=>r.addEventListener('change',checkAfibLaao));
    const afibObs=new MutationObserver(checkAfibLaao);
    const afibHidden=document.getElementById('val_afib');
    if(afibHidden) afibObs.observe(afibHidden,{attributes:true,attributeFilter:['value']});

    const ciedHidden=document.getElementById('val_cied');
    if(ciedHidden) new MutationObserver(()=>{
        if(ciedHidden.value==='No'){
            const ic=document.querySelector('[name="crtGenerator"][value="Initial implant"]');
            const ip=document.querySelector('[name="ppmGenerator"][value="Initial implant"]');
            if(ic&&!document.querySelector('[name="crtGenerator"]:checked')){ic.checked=true;onCrtGenChange();}
            if(ip&&!document.querySelector('[name="ppmGenerator"]:checked')){ip.checked=true;onPpmGenChange();}
        }
    }).observe(ciedHidden,{attributes:true,attributeFilter:['value']});

    document.querySelector('input[name="crtInd_inherited"]')?.addEventListener('change', function() {
        document.getElementById('crtInheritedSub').classList.toggle('show', this.checked);
    });

    document.getElementById('epsForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mandatory=[
            {id:'req_nameFirst',label:'Patient First Name'},{id:'req_nameLast',label:'Patient Last Name'},
            {id:'civilId',label:'Civil ID'},{id:'req_crfNo',label:'CRF Number'},{id:'req_fileNo',label:'File Number'},
        ];
        for(const f of mandatory){
            const el=document.getElementById(f.id);
            if(!el||!el.value.trim()){goToStep(0);el?.focus();el?.scrollIntoView({behavior:'smooth',block:'center'});showError(el,'This field is required');setTimeout(()=>clearValidation(el),3000);alert(`Required: "${f.label}"`);return;}
        }
        if(!/^\d{12}$/.test(document.getElementById('civilId').value)){goToStep(0);alert('Civil ID must be 12 digits.');return;}
        const civFirst=parseInt(document.getElementById('civilId').value[0]);
        if(civFirst!==2&&civFirst!==3){goToStep(0);alert('Civil ID must start with 2 or 3.');return;}
        if(!/^\d{6}$/.test(document.getElementById('req_fileNo').value)){goToStep(0);alert('File Number must be 6 digits.');return;}
        
        const civilIdVal=document.getElementById('civilId').value;
        const recordId=document.getElementById('editRecordId').value;
        const dupSnap=await getDocs(collection(window._db,'patients_full'));
        let dupFound=false;
        dupSnap.forEach(docSnap=>{if(docSnap.id!==recordId&&docSnap.data().civilId===civilIdVal) dupFound=true;});
        if(dupFound){if(!confirm(`⚠ Civil ID ${civilIdVal} already exists. Save anyway?`))return;}
        
        const fd=new FormData(e.target);
        const dataObj=Object.fromEntries(fd.entries());
        e.target.querySelectorAll('input[type="checkbox"]').forEach(cb=>{dataObj[cb.name]=cb.checked;});
        e.target.querySelectorAll('input[type="radio"]:checked').forEach(r=>{dataObj[r.name]=r.value;});
        dataObj.timestamp=new Date();
        const recId=dataObj.recordId; delete dataObj.recordId;
        
        const btn=document.getElementById('btnSubmit');
        btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving…';
        try {
            if(recId){await setDoc(doc(window._db,'patients_full',recId),dataObj);alert('Record updated!');document.getElementById('editModeBanner').classList.add('hidden');}
            else {await addDoc(collection(window._db,'patients_full'),dataObj);alert('Record saved!');}
            resetFormUI(e.target); loadRecordsCache();
        } catch(err){console.error(err);alert('Save failed — check connection.');}
        finally {btn.disabled=false;btn.innerHTML='<i class="fas fa-save"></i> Save Record';}
    });
}

function resetFormUI(form) {
    form.reset();
    document.querySelectorAll('.sub-reveal').forEach(s=>s.classList.remove('show'));
    document.querySelectorAll('.yn-btn').forEach(b=>b.classList.remove('selected'));
    document.querySelectorAll('.yn-btn.yn-no').forEach(b=>b.classList.add('selected'));
    document.querySelectorAll('input[type="hidden"][id^="val_"]').forEach(h=>h.value='No');
    document.querySelectorAll('.proc-section').forEach(s=>s.classList.remove('show'));
    document.querySelectorAll('.val-tip').forEach(t=>t.remove());
    document.querySelectorAll('[style*="border-color"]').forEach(el=>{el.style.borderColor='';el.style.boxShadow='';});
    document.getElementById('proc_noReason').style.display='block';
    ['lvef_suggest','arrest_suggest','laao_afib_warn'].forEach(id=>document.getElementById(id)?.remove());
    goToStep(0);
}

window.switchTab = function(tab) {
    if(tab==='admin'){ if(prompt('Enter Admin PIN:')!=='2468'){alert('Access Denied');return;} fetchData(); }
    else if(tab==='analytics') fetchAnalytics();
    ['form','admin','analytics'].forEach(t=>{
        document.getElementById(`section-${t}`).classList.add('hidden');
        document.getElementById(`tab-${t}`).className='pb-1 text-gray-500 hover:text-blue-700 text-sm font-medium transition';
    });
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).className='pb-1 tab-active text-sm transition';
};

// ============================================================
// ADMIN AND SEARCH LOGIC
// ============================================================
let allData=[];
let _allRecordsCache=[];

async function loadRecordsCache() {
    const snapshot=await getDocs(collection(window._db,"patients_full"));
    _allRecordsCache=[];
    snapshot.forEach(docSnap=>{
        const d=docSnap.data(); d.id=docSnap.id;
        d.fullName=`${d.nameFirst||''} ${d.nameMiddle||''} ${d.nameLast||''}`.trim();
        _allRecordsCache.push(d);
    });
}

window.fetchData = async function() {
    const sName=document.getElementById('searchName').value.toLowerCase();
    const sCivil=document.getElementById('searchCivilId').value;
    const sFile=document.getElementById('searchFileNo').value;
    const snapshot=await getDocs(collection(window._db,'patients_full'));
    const tbody=document.getElementById('tableBody');
    tbody.innerHTML=''; allData=[];
    snapshot.forEach(docSnap=>{
        const data=docSnap.data(); data.id=docSnap.id;
        const fullName=`${data.nameFirst||''} ${data.nameMiddle||''} ${data.nameLast||''}`.trim();
        if(sName&&!fullName.toLowerCase().includes(sName)) return;
        if(sCivil&&!data.civilId?.includes(sCivil)) return;
        if(sFile&&!data.fileNumber?.includes(sFile)) return;
        data.fullName=fullName; allData.push(data);
        const tr=document.createElement('tr');
        tr.innerHTML=`
            <td><div class="font-bold text-gray-800">${fullName||'Anonymous'}</div><div class="text-xs text-gray-500">${data.gender||''} | Age: ${data.estimatedAge||'?'}</div></td>
            <td class="text-xs"><div><span class="font-semibold text-gray-500">CID:</span> ${data.civilId||'—'}</div><div><span class="font-semibold text-gray-500">File:</span> ${data.fileNumber||'—'}</div></td>
            <td><span class="badge badge-blue">${data.epReason||'—'}</span></td>
            <td class="text-xs text-gray-600">${data.admissionDate||'—'}</td>
            <td class="text-right space-x-1" style="white-space:nowrap;">
                <button onclick='editRecord(${JSON.stringify(data).replace(/'/g,"\\'")})' class="btn btn-yellow text-xs px-2 py-1" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick='exportSinglePDF(${JSON.stringify(data).replace(/'/g,"\\'")})' class="btn btn-purple text-xs px-2 py-1" title="Full Clinical PDF"><i class="fas fa-file-pdf"></i></button>
                <button onclick="deleteRecord('${data.id}')" class="btn btn-red text-xs px-2 py-1" title="Delete"><i class="fas fa-trash"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
    if(!allData.length) tbody.innerHTML='<tr><td colspan="5" class="text-center py-8 text-gray-400">No records found</td></tr>';
    _allRecordsCache=allData.slice();
};

window.deleteRecord = async function(id) {
    if(!confirm('Permanently delete this record?')) return;
    try { await deleteDoc(doc(window._db,'patients_full',id)); fetchData(); }
    catch(e){alert('Delete failed.');}
};

window.editRecord = function(data) {
    switchTab('form');
    document.getElementById('epsForm').reset();
    document.getElementById('editRecordId').value=data.id;
    document.getElementById('editModeBanner').classList.remove('hidden');
    Object.keys(data).forEach(key=>{
        const el=document.getElementsByName(key)[0]; if(!el) return;
        if(el.type==='checkbox') el.checked=!!data[key];
        else if(el.type==='radio') document.getElementsByName(key).forEach(r=>{if(r.value===data[key]) r.checked=true;});
        else el.value=data[key]||'';
    });
    if(data.epReason) onEpReasonChange();
    goToStep(0);
};

window.quickSearch = function() {
    const q=document.getElementById('qs_input').value.trim();
    if(!q){document.getElementById('qs_results').classList.add('hidden');return;}
    const results=_allRecordsCache.filter(d=>(d.civilId||'').includes(q)||(d.fileNumber||'').includes(q)||(d.crfNo||'').includes(q));
    const container=document.getElementById('qs_results');
    const list=document.getElementById('qs_list');
    document.getElementById('qs_count').textContent=`${results.length} found`;
    if(!results.length){list.innerHTML='<div class="px-4 py-6 text-center text-gray-400 text-sm">No matching records found</div>';}
    else {
        list.innerHTML=results.slice(0,8).map(d=>`
            <div class="px-4 py-3 hover:bg-blue-50 cursor-pointer transition flex items-center justify-between gap-3" onclick='editFromSearch(${JSON.stringify(d).replace(/'/g,"\\'")})'>
                <div>
                    <div class="font-bold text-gray-800 text-sm">${d.fullName||'Anonymous'}</div>
                    <div class="text-xs text-gray-500 mt-0.5">
                        <span class="mr-3">CID: <span class="font-mono font-semibold">${d.civilId||'—'}</span></span>
                        <span class="mr-3">File: <span class="font-mono font-semibold">${d.fileNumber||'—'}</span></span>
                        <span>CRF: <span class="font-mono font-semibold">${d.crfNo||'—'}</span></span>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span class="badge badge-blue text-xs">${d.epReason||'—'}</span>
                    <button class="btn btn-yellow text-xs px-2 py-1" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick='event.stopPropagation();exportSinglePDF(${JSON.stringify(d).replace(/'/g,"\\'")})' class="btn btn-purple text-xs px-2 py-1" title="PDF"><i class="fas fa-file-pdf"></i></button>
                </div>
            </div>`).join('');
    }
    container.classList.remove('hidden');
};
window.clearQuickSearch = function() {
    document.getElementById('qs_input').value='';
    document.getElementById('qs_results').classList.add('hidden');
};
window.editFromSearch = function(data) { clearQuickSearch(); editRecord(data); };
document.addEventListener('click', e=>{
    if(document.getElementById('mainSearchBar') && !document.getElementById('mainSearchBar').contains(e.target))
        document.getElementById('qs_results').classList.add('hidden');
});

// ============================================================
// EXPORT UTILITIES (Excel & PDF)
// ============================================================
const FIELD_MAP = {
  nameFirst:'First Name', nameMiddle:'Middle Name', nameLast:'Last Name',
  civilId:'Civil ID', crfNo:'CRF Number', fileNumber:'File Number',
  gender:'Gender', nationality:'Nationality', yob:'Year of Birth',
  estimatedAge:'Est. Age (yrs)', admissionDate:'Admission Date',
  patientContact:'Patient Contact', relativeContact:'Relative Contact',
  epReason:'EP Lab Reason', pacemakerType:'Pacemaker Type',
  patientOrigin:'Patient Origin',
  sysBp:'Systolic BP (mmHg)', diaBp:'Diastolic BP (mmHg)',
  hr:'Heart Rate (/min)', weight:'Weight (kg)', height:'Height (cm)',
  hx_afib:'Atrial Fibrillation', afibClassification:'AFib Classification',
  afibCardioversion:'Plans for Cardioversion', afibPriorAblation:'Prior Ablation Attempt',
  afibChads:'CHA₂DS₂-VASc Score', afibHasBled:'HAS-BLED Score',
  afibContraOAC:'Contraindication to OAC', afibMajorBleed:'Prior Major Bleeding',
  hx_cardiacArrest:'Cardiac Arrest', arrestBradycardia:'Bradycardia Arrest',
  arrestVF:'VF Arrest', arrestVT:'VT Arrest',
  hx_icm:'Ischemic Cardiomyopathy', icmTimeframe:'ICM Timeframe', icmGDMT:'GDMT Max Dose',
  hx_hf:'Heart Failure', hfType:'HF Type',
  hx_cad:'Coronary Artery Disease', hx_mi:'Myocardial Infarction',
  hx_valve:'Valvular Heart Disease', hx_cvd:'Cerebrovascular Disease',
  hx_lung:'Chronic Lung Disease', hx_dialysis:'On Dialysis',
  hx_dm:'Diabetes Mellitus', hx_htn:'Hypertension',
  hx_familialSyndrome:'Familial Syndrome (SCD risk)',
  hx_ssd:'Syndrome of Sudden Death', ssd_brugada:'Brugada',
  ssd_cpvt:'Catecholaminergic PVT', ssd_idiopathic:'Idiopathic VT/VF',
  ssd_longqt:'Long QT', ssd_shortqt:'Short QT',
  hx_struct:'Structural Abnormalities', struct_arvc:'ARVC',
  struct_congenital:'Congenital HD', struct_hcm:'HCM high-risk',
  struct_infiltrative:'Infiltrative', struct_lv:'LV Structural Abnormality',
  hx_syncope:'Syncope', syncopeRecent:'Syncope within 6 months',
  hx_svt:'Paroxysmal SVT', hx_vf:'Ventricular Fibrillation',
  hx_vt:'Ventricular Tachycardia',
  hx_avp:'Aortic Valve Procedure', avpType:'AVP Type', avpRecent:'AVP <6 months',
  hx_mvp:'Mitral Valve Procedure', mvpType:'MVP Type', mvpRecent:'MVP <6 months',
  hx_ca:'Coronary Angiography', caRecent:'CA <6 months', caAfterArrest:'CA after Arrest',
  hx_cabg:'Prior CABG', cabgRecent:'CABG <6 months',
  hx_pci:'Prior PCI', pciRecent:'PCI <6 months', hx_cied:'Prior CIED',
  cied_single:'Prior: Single-ch PPM', cied_dual:'Prior: Dual-ch PPM',
  cied_crtp:'Prior: CRT-P', cied_leadlessSingle:'Prior: Leadless Single',
  cied_leadlessDual:'Prior: Leadless Dual', cied_his:'Prior: His-bundle PPM',
  cied_lbbb:'Prior: LBBB PPM', cied_icdSingle:'Prior: ICD Single',
  cied_icdDual:'Prior: ICD Dual', cied_crtd:'Prior: CRT-D',
  cied_evicd:'Prior: Extravascular ICD', cied_sicd:'Prior: S-ICD',
  homeMed_amiodarone:'HMed: Amiodarone', homeMed_disopyramide:'HMed: Disopyramide',
  homeMed_flecainide:'HMed: Flecainide', homeMed_procainamide:'HMed: Procainamide',
  homeMed_propafenone:'HMed: Propafenone', homeMed_sotalol:'HMed: Sotalol',
  homeMed_verapamil:'HMed: Verapamil', homeMed_diltiazem:'HMed: Diltiazem',
  homeMed_warfarin:'HMed: Warfarin', homeMed_dabigatran:'HMed: Dabigatran',
  homeMed_apixaban:'HMed: Apixaban', homeMed_rivaroxaban:'HMed: Rivaroxaban',
  homeMed_edoxaban:'HMed: Edoxaban', homeMed_lmwh:'HMed: LMWH',
  homeMed_ufheparin:'HMed: UFHeparin', homeMed_aspirin:'HMed: Aspirin',
  homeMed_prasugrel:'HMed: Prasugrel', homeMed_clopidogrel:'HMed: Clopidogrel',
  homeMed_ticagrelor:'HMed: Ticagrelor', homeMed_cangrelor:'HMed: Cangrelor',
  homeMed_acei:'HMed: ACE-I', homeMed_arb:'HMed: ARB', homeMed_arni:'HMed: ARNI',
  homeMed_sglt:'HMed: SGLT Inhibitor', homeMed_betablocker:'HMed: Beta Blockers',
  homeMed_mra:'HMed: MRA', homeMed_digoxin:'HMed: Digoxin',
  homeMed_loopdiuretic:'HMed: Loop Diuretics',
  inv_ecg:'ECG Done', ecgAtrialRhythm:'ECG Atrial Rhythm',
  ecgVentRhythm:'ECG Ventricular Rhythm', ecgQRS:'QRS Duration (msec)',
  inv_holter:'Holter Done', holterAtrialRhythm:'Holter Atrial Rhythm',
  holterVentRhythm:'Holter Ventricular Rhythm',
  inv_tte:'TTE Done', lvef:'LVEF (%)', lvesd:'LVESD (mm)', lvedd:'LVEDD (mm)',
  rvsp:'RVSP (mmHg)', inv_sevValve:'Severe Valve Disease',
  sevMR:'Severe MR', sevAS:'Severe AS', sevAR:'Severe AR', sevTR:'Severe TR',
  intracardThrombus:'Intracardiac Thrombus', inv_tee:'TEE Done',
  teeThrombus:'TEE Atrial Thrombus', inv_laa:'LAA Morphology Assessed',
  laaOstial:'LAA Ostial Diameter (mm)', laaDepth:'LAA Depth (mm)',
  inv_cardiacCT:'Cardiac CT Done', inv_cmr:'Cardiac MRI Done',
  creatInit:'Creatinine Initial (µmol/L)', creatPeak:'Creatinine Peak (µmol/L)',
  hgbInit:'Hemoglobin Initial (g/dL)', hgbLowest:'Hemoglobin Lowest (g/dL)',
  sodium:'Sodium (mEq/L)', potassium:'Potassium (mEq/L)',
  magnesium:'Magnesium (mEq/L)', inr:'INR',
  procStartDate:'Procedure Start Date', procStartTime:'Procedure Start Time',
  procEndTime:'Procedure End Time', operatorName:'Operator',
  crtInd_surv:'CRT Ind: Arrest Survivor', crtInd_eps:'CRT Ind: Inducible VT',
  crtInd_icmEF:'CRT Ind: ICM EF≤35%', crtInd_nicmEF:'CRT Ind: Non-ICM EF≤35%',
  crtInd_inherited:'CRT Ind: Inherited SCD',
  crtGenerator:'CRT Generator', crtDeviceName:'CRT Device Name',
  crt_implant:'CRT Implanted', crtDeviceType:'CRT Device Type',
  crtLead:'CRT Lead Assessment', crtLeadStatus:'CRT Lead Status',
  ppmGenerator:'PPM Generator', ppmDeviceName:'PPM Device Name',
  ppm_implant:'PPM Implanted', ppmDeviceType:'PPM Device Type',
  ppmInd_chb:'PPM Ind: CHB', ppmInd_sss:'PPM Ind: SSS',
  ppmInd_21block:'PPM Ind: 2:1 AV Block', ppmInd_mobitz2:'PPM Ind: Mobitz II',
  ppmInd_avAblation:'PPM Ind: AV Ablation', ppmInd_rvPacing:'PPM Ind: >40% RV Pacing',
  ppmInd_chrono:'PPM Ind: Chronotropic Incompetence',
  ppmLead:'PPM Lead Assessment', ppmLeadStatus:'PPM Lead Status',
  eps_avnrt:'EPS: AVNRT', eps_wpw:'EPS: WPW', eps_aflutter:'EPS: Atrial Flutter',
  eps_afib:'EPS: AFib', eps_vt:'EPS: VT', eps_pvcs:'EPS: PVCs',
  epsSedation:'EPS Sedation', epsTransseptal:'Transseptal Catheterization',
  epsICE:'Intracardiac Echo', epsAblTime:'Ablation Time (min)',
  epsFluoroTime:'Fluoroscopy Time (min)', eps_anticoag:'Intraprocedural Anticoagulation',
  epsUninterruptedAnticoag:'Uninterrupted Anticoagulation',
  epsMappingSystem:'Mapping System', epsCathManip:'Catheter Manipulation',
  epsInducedArrhythmia:'Induced Arrhythmia', epsPhrenicNerve:'Phrenic Nerve Evaluation',
  laaoDeviceType:'LAAO Device Type', laaoDeviceSize:'LAAO Device Size (mm)',
  laaoAttempts:'LAAO Deployment Attempts', laaoTransseptal:'LAAO Transseptal',
  laaoImaging:'LAAO Imaging Guidance', laaoPASS:'LAAO PASS Criteria',
  laaoLeak:'LAAO Peri-device Leak', laaoAnticoag:'LAAO Anticoagulation',
  laaoOutcome:'LAAO Immediate Outcome',
  comp_ca:'Procedure: CA', comp_pci:'Procedure: PCI',
  comp_cabg:'Procedure: CABG', comp_tavr:'Procedure: TAVR',
  cx_cardArrest:'CX: Cardiac Arrest', cx_pulEdema:'CX: Pulmonary Edema',
  cx_tamponade1:'CX: Tamponade (pre-proc)', cx_renal:'CX: Renal Impairment',
  cx_dialysis:'CX: Dialysis Required', cx_stroke:'CX: Stroke', strokeType:'CX: Stroke Type',
  cx_vascular:'CX: Vascular Complications', cx_hematoma:'CX: Hematoma',
  cx_occlusion:'CX: Occlusion', cx_avFistula:'CX: AV Fistula',
  cx_pseudoAneurysm:'CX: Pseudoaneurysm', cx_vasIntervention:'CX: Vascular Intervention',
  vasInterventionType:'CX: Intervention Type',
  cx_periEmbol:'CX: Peripheral Embolization', cx_pericarditis:'CX: Pericarditis',
  cx_cardShock:'CX: Cardiogenic Shock', scaiStage:'CX: SCAI Stage',
  cx_ventilation:'CX: Ventilation', ventType:'CX: Ventilation Type',
  cx_inotropes:'CX: Inotropes', cx_mechComp:'CX: Mechanical Complications',
  mechCompType:'CX: Mechanical Type', cx_bleeding:'CX: Any Bleeding',
  bleedType:'CX: Bleeding Type', bleedSubType:'CX: Bleeding Subtype',
  bleedSite_gi:'CX: GI Bleeding', bleedSite_retro:'CX: Retroperitoneal Bleeding',
  bleedSite_gu:'CX: GU Bleeding', bleedSite_entry:'CX: Entry Site Bleeding',
  cx_transfusion:'CX: Transfusion', transfusionUnits:'CX: Transfusion Units',
  cx_mi:'CX: MI', cx_urgentSurgery:'CX: Urgent Cardiac Surgery',
  cx_periEff:'CX: Pericardial Effusion', cx_periEffIntervention:'CX: Effusion Intervention',
  cx_tamponade2:'CX: Tamponade (post-proc)', cx_tamponadeOCS:'CX: Open Cardiac Surgery',
  cx_tamponadeDrain:'CX: Percutaneous Drainage',
  cx_hemothorax:'CX: Hemothorax', cx_hemothoraxDrain:'CX: Hemothorax Drainage',
  cx_pneumothorax:'CX: Pneumothorax', cx_pneumothoraxIntervention:'CX: Pneumothorax Intervention',
  cx_devEmbol:'CX: Device Embolization', cx_phrenicDmg:'CX: Phrenic Nerve Damage',
  cx_pleuralEff:'CX: Pleural Effusion', cx_infection:'CX: Infection',
  cx_setScrew:'CX: Set Screw Problem', cx_leadDislodge:'CX: Lead Dislodgement',
  cx_bradyAdverse:'CX: Bradycardia Adverse Events', cx_bradyPPM:'CX: Requires PPM',
  procSuccess:'Procedure Success', postECGrhythm:'Post-Procedure ECG Rhythm',
  out_csp:'Conduction System Pacing', cspQRS:'CSP Final QRS (msec)',
  dischargeDate:'Discharge Date', dischargeTime:'Discharge Time',
  dischargeStatus:'Discharge Status', causeOfDeath:'Cause of Death',
  dischargeType:'Discharge Type',
  dcMed_amiodarone:'DCMed: Amiodarone', dcMed_disopyramide:'DCMed: Disopyramide',
  dcMed_flecainide:'DCMed: Flecainide', dcMed_sotalol:'DCMed: Sotalol',
  dcMed_warfarin:'DCMed: Warfarin', dcMed_dabigatran:'DCMed: Dabigatran',
  dcMed_apixaban:'DCMed: Apixaban', dcMed_rivaroxaban:'DCMed: Rivaroxaban',
  dcMed_lmwh:'DCMed: LMWH', dcMed_aspirin:'DCMed: Aspirin',
  dcMed_clopidogrel:'DCMed: Clopidogrel', dcMed_ticagrelor:'DCMed: Ticagrelor',
  dcMed_acei:'DCMed: ACE-I', dcMed_arb:'DCMed: ARB', dcMed_arni:'DCMed: ARNI',
  dcMed_sglt:'DCMed: SGLT Inhibitor', dcMed_betablocker:'DCMed: Beta Blockers',
  dcMed_mra:'DCMed: MRA', dcMed_digoxin:'DCMed: Digoxin',
  dcMed_loopdiuretic:'DCMed: Loop Diuretics',
};

const PDF_SECTIONS = [
  { title:'1. Patient Identification', color:[30,64,175], fields:['nameFirst','nameMiddle','nameLast','civilId','crfNo','fileNumber','gender','nationality','yob','estimatedAge','admissionDate','patientContact','relativeContact'] },
  { title:'2–3. EP Lab Reason & Admission', color:[79,70,229], fields:['epReason','pacemakerType','patientOrigin'] },
  { title:'4–5. History, Risk Factors & Vitals', color:[185,28,28], fields:['sysBp','diaBp','hr','weight','height','hx_afib','afibClassification','afibChads','afibHasBled','afibCardioversion','afibPriorAblation','afibContraOAC','afibMajorBleed','hx_cardiacArrest','arrestBradycardia','arrestVF','arrestVT','hx_icm','icmTimeframe','icmGDMT','hx_hf','hfType','hx_cad','hx_mi','hx_valve','hx_cvd','hx_lung','hx_dialysis','hx_dm','hx_htn','hx_familialSyndrome','hx_ssd','ssd_brugada','ssd_cpvt','ssd_idiopathic','ssd_longqt','ssd_shortqt','hx_struct','struct_arvc','struct_congenital','struct_hcm','struct_infiltrative','struct_lv','hx_syncope','syncopeRecent','hx_svt','hx_vf','hx_vt','hx_avp','avpType','avpRecent','hx_mvp','mvpType','mvpRecent','hx_ca','caRecent','caAfterArrest','hx_cabg','cabgRecent','hx_pci','pciRecent','hx_cied','cied_single','cied_dual','cied_crtp','cied_leadlessSingle','cied_leadlessDual','cied_his','cied_lbbb','cied_icdSingle','cied_icdDual','cied_crtd','cied_evicd','cied_sicd'] },
  { title:'6. Home Medications at Admission', color:[5,150,105], fields:['homeMed_amiodarone','homeMed_disopyramide','homeMed_flecainide','homeMed_procainamide','homeMed_propafenone','homeMed_sotalol','homeMed_verapamil','homeMed_diltiazem','homeMed_warfarin','homeMed_dabigatran','homeMed_apixaban','homeMed_rivaroxaban','homeMed_edoxaban','homeMed_lmwh','homeMed_ufheparin','homeMed_aspirin','homeMed_prasugrel','homeMed_clopidogrel','homeMed_ticagrelor','homeMed_cangrelor','homeMed_acei','homeMed_arb','homeMed_arni','homeMed_sglt','homeMed_betablocker','homeMed_mra','homeMed_digoxin','homeMed_loopdiuretic'] },
  { title:'7–8. Investigations & Laboratory', color:[109,40,217], fields:['inv_ecg','ecgAtrialRhythm','ecgVentRhythm','ecgQRS','inv_holter','holterAtrialRhythm','holterVentRhythm','inv_tte','lvef','lvesd','lvedd','rvsp','inv_sevValve','sevMR','sevAS','sevAR','sevTR','intracardThrombus','inv_tee','teeThrombus','inv_laa','laaOstial','laaDepth','inv_cardiacCT','inv_cmr','creatInit','creatPeak','hgbInit','hgbLowest','sodium','potassium','magnesium','inr'] },
  { title:'9. Procedure Details', color:[30,64,175], fields:['procStartDate','procStartTime','procEndTime','operatorName','crtInd_surv','crtInd_eps','crtInd_icmEF','crtInd_nicmEF','crtInd_inherited','crtGenerator','crtDeviceName','crt_implant','crtDeviceType','crtLead','crtLeadStatus','ppmGenerator','ppmDeviceName','ppm_implant','ppmDeviceType','ppmInd_chb','ppmInd_sss','ppmInd_21block','ppmInd_mobitz2','ppmInd_avAblation','ppmInd_rvPacing','ppmInd_chrono','ppmLead','ppmLeadStatus','eps_avnrt','eps_wpw','eps_aflutter','eps_afib','eps_vt','eps_pvcs','epsSedation','epsTransseptal','epsICE','epsAblTime','epsFluoroTime','eps_anticoag','epsUninterruptedAnticoag','epsMappingSystem','epsCathManip','epsInducedArrhythmia','epsPhrenicNerve','laaoDeviceType','laaoDeviceSize','laaoAttempts','laaoTransseptal','laaoImaging','laaoPASS','laaoLeak','laaoAnticoag','laaoOutcome'] },
  { title:'10. Events & Complications', color:[220,38,38], fields:['comp_ca','comp_pci','comp_cabg','comp_tavr','cx_cardArrest','cx_pulEdema','cx_tamponade1','cx_renal','cx_dialysis','cx_stroke','strokeType','cx_vascular','cx_hematoma','cx_occlusion','cx_avFistula','cx_pseudoAneurysm','cx_vasIntervention','vasInterventionType','cx_periEmbol','cx_pericarditis','cx_cardShock','scaiStage','cx_ventilation','ventType','cx_inotropes','cx_mechComp','mechCompType','cx_bleeding','bleedType','bleedSubType','bleedSite_gi','bleedSite_retro','bleedSite_gu','bleedSite_entry','cx_transfusion','transfusionUnits','cx_mi','cx_urgentSurgery','cx_periEff','cx_periEffIntervention','cx_tamponade2','cx_tamponadeOCS','cx_tamponadeDrain','cx_hemothorax','cx_hemothoraxDrain','cx_pneumothorax','cx_pneumothoraxIntervention','cx_devEmbol','cx_phrenicDmg','cx_pleuralEff','cx_infection','cx_setScrew','cx_leadDislodge','cx_bradyAdverse','cx_bradyPPM'] },
  { title:'11–13. Outcome, Discharge & Medications', color:[5,150,105], fields:['procSuccess','postECGrhythm','out_csp','cspQRS','dischargeDate','dischargeTime','dischargeStatus','causeOfDeath','dischargeType','dcMed_amiodarone','dcMed_disopyramide','dcMed_flecainide','dcMed_sotalol','dcMed_warfarin','dcMed_dabigatran','dcMed_apixaban','dcMed_rivaroxaban','dcMed_lmwh','dcMed_aspirin','dcMed_clopidogrel','dcMed_ticagrelor','dcMed_acei','dcMed_arb','dcMed_arni','dcMed_sglt','dcMed_betablocker','dcMed_mra','dcMed_digoxin','dcMed_loopdiuretic'] },
];

function _fmtVal(val) {
  if(val === undefined || val === null || val === '') return '—';
  if(val === true  || val === 'true')  return '✔ Yes';
  if(val === false || val === 'false') return 'No';
  return String(val);
}

window.exportToExcel = function() {
  const data = allData;
  if(!data || !data.length) { alert('No data to export. Please search first.'); return; }
  const wb = XLSX.utils.book_new();
  const date = new Date().toISOString().slice(0,10);
  
  const allKeys = Object.keys(FIELD_MAP);
  const headers = allKeys.map(k => FIELD_MAP[k]);
  const rows = data.map(r => {
    const row = {};
    headers.forEach((h, i) => {
      const raw = r[allKeys[i]];
      row[h] = (raw===true||raw==='true')?'Yes':(raw===false||raw==='false')?'No':(raw===undefined||raw===null||raw==='')?'':String(raw);
    });
    return row;
  });
  const ws1 = XLSX.utils.json_to_sheet(rows, { header: headers });
  ws1['!cols'] = headers.map(h => ({ wch: Math.min(Math.max(h.length+2, 12), 36) }));
  ws1['!freeze'] = { xSplit:0, ySplit:1, topLeftCell:'A2', state:'frozen' };
  XLSX.utils.book_append_sheet(wb, ws1, 'All Clinical Data');
  
  const procRows = data.map(r => {
    const los = (r.admissionDate && r.dischargeDate) ? Math.round((new Date(r.dischargeDate)-new Date(r.admissionDate))/(1000*60*60*24)) : '';
    const epsReasons = ['avnrt','wpw','aflutter','afib','vt','pvcs'].filter(x=>r['eps_'+x]===true||r['eps_'+x]==='true').join(', ').toUpperCase();
    return {
      'Patient Name': `${r.nameFirst||''} ${r.nameLast||''}`.trim(),
      'Civil ID': r.civilId||'', 'File No.': r.fileNumber||'', 'CRF No.': r.crfNo||'',
      'Gender': r.gender||'', 'Age': r.estimatedAge||'', 'Nationality': r.nationality||'',
      'Admission Date': r.admissionDate||'', 'EP Reason': r.epReason||'',
      'Pacemaker Type': r.pacemakerType||'', 'Patient Origin': r.patientOrigin||'',
      'Proc. Date': r.procStartDate||'', 'Start Time': r.procStartTime||'',
      'End Time': r.procEndTime||'', 'Operator': r.operatorName||'',
      'CRT Device Name': r.crtDeviceName||'', 'CRT Device Type': r.crtDeviceType||'',
      'PPM Device Name': r.ppmDeviceName||'', 'PPM Device Type': r.ppmDeviceType||'',
      'EPS Reasons': epsReasons||'', 'Ablation Time (min)': r.epsAblTime||'',
      'Fluoroscopy (min)': r.epsFluoroTime||'', 'Mapping System': r.epsMappingSystem||'',
      'LAAO Device': r.laaoDeviceType||'', 'LAAO Size (mm)': r.laaoDeviceSize||'',
      'LAAO Outcome': r.laaoOutcome||'', 'Procedure Success': r.procSuccess||'', 'Post-ECG Rhythm': r.postECGrhythm||'',
      'Discharge Status': r.dischargeStatus||'', 'Discharge Date': r.dischargeDate||'',
      'LOS (days)': los, 'Discharge Type': r.dischargeType||'',
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(procRows);
  ws2['!cols'] = Object.keys(procRows[0]||{}).map(h=>({wch:Math.max(h.length+2,12)}));
  XLSX.utils.book_append_sheet(wb, ws2, 'Procedures');

  const cxRows = data.map(r => {
    const cx = (field) => (r[field]==='Yes'||r[field]===true||r[field]==='true')?'Yes':'No';
    return {
      'Patient Name': `${r.nameFirst||''} ${r.nameLast||''}`.trim(), 'Civil ID': r.civilId||'', 'File No.': r.fileNumber||'',
      'EP Reason': r.epReason||'', 'Proc. Date': r.procStartDate||'', 'Discharge Status': r.dischargeStatus||'',
      'Cardiac Arrest': cx('cx_cardArrest'), 'Pulmonary Edema': cx('cx_pulEdema'),
      'Stroke': cx('cx_stroke'), 'Stroke Type': r.strokeType||'', 'Renal Impairment': cx('cx_renal'), 'Dialysis': cx('cx_dialysis'),
      'Vascular Complication': cx('cx_vascular'), 'Hematoma': cx('cx_hematoma'), 'AV Fistula': cx('cx_avFistula'), 
      'Pseudoaneurysm': cx('cx_pseudoAneurysm'), 'Peripheral Embolization': cx('cx_periEmbol'), 'Pericarditis': cx('cx_pericarditis'),
      'Cardiogenic Shock': cx('cx_cardShock'), 'SCAI Stage': r.scaiStage||'', 'Ventilation': cx('cx_ventilation'),
      'Ventilation Type': r.ventType||'', 'Inotropes': cx('cx_inotropes'), 'Mechanical Complications': cx('cx_mechComp'),
      'Any Bleeding': cx('cx_bleeding'), 'Bleeding Type': r.bleedType||'', 'Transfusion': cx('cx_transfusion'),
      'Transfusion Units': r.transfusionUnits||'', 'MI': cx('cx_mi'), 'Urgent Surgery': cx('cx_urgentSurgery'),
      'Pericardial Effusion': cx('cx_periEff'), 'Effusion Intervention': cx('cx_periEffIntervention'),
      'Tamponade (post)': cx('cx_tamponade2'), 'Open Cardiac Surgery': cx('cx_tamponadeOCS'), 'Percutaneous Drainage': cx('cx_tamponadeDrain'),
      'Hemothorax': cx('cx_hemothorax'), 'Pneumothorax': cx('cx_pneumothorax'), 'Device Embolization': cx('cx_devEmbol'),
      'Phrenic Nerve Damage': cx('cx_phrenicDmg'), 'Pleural Effusion': cx('cx_pleuralEff'), 'Infection': cx('cx_infection'),
      'Set Screw Problem': cx('cx_setScrew'), 'Lead Dislodgement': cx('cx_leadDislodge'),
      'Bradycardia Adverse': cx('cx_bradyAdverse'), 'Requires PPM': cx('cx_bradyPPM'),
    };
  });
  const ws4 = XLSX.utils.json_to_sheet(cxRows);
  ws4['!cols'] = Object.keys(cxRows[0]||{}).map(h=>({wch:Math.max(h.length+2,12)}));
  XLSX.utils.book_append_sheet(wb, ws4, 'Complications');

  XLSX.writeFile(wb, `MKH_EP_Registry_${date}.xlsx`);
};

window.exportToPDF = function() {
  const data = allData;
  if(!data || !data.length) { alert('No data to export.'); return; }
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setFillColor(15,23,42);
  doc.rect(0,0,W,20,'F');
  doc.setFillColor(30,64,175);
  doc.rect(0,18,W,4,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(13); doc.setFont('helvetica','bold');
  doc.text('MUBARAK ALKABEER HOSPITAL — EP REGISTRY', W/2, 9, {align:'center'});
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184);
  doc.text(`All Patients Summary  ·  Generated: ${new Date().toLocaleDateString('en-GB')}  ·  Total Records: ${data.length}`, W/2, 15, {align:'center'});

  doc.autoTable({
    startY: 26,
    styles:{ fontSize:6.5, cellPadding:2, overflow:'linebreak', valign:'middle' },
    headStyles:{ fillColor:[30,64,175], textColor:255, fontStyle:'bold', halign:'center', fontSize:6.5 },
    alternateRowStyles:{ fillColor:[240,246,255] },
    margin:{ left:6, right:6 },
    head:[['Patient Name','Civil ID / File','Admission','Sex','Age','EP Reason','Operator','Success','Discharge','AFib','HF','LVEF%','Complications','LOS']],
    body: data.map(r => {
      const cxList = [
        r.cx_stroke==='Yes'&&'Stroke', r.cx_bleeding==='Yes'&&'Bleeding', r.cx_tamponade2==='Yes'&&'Tamponade',
        r.cx_pneumothorax==='Yes'&&'Pneumo', r.cx_renal==='Yes'&&'Renal', r.cx_cardShock==='Yes'&&'Shock',
        r.cx_vascular==='Yes'&&'Vascular', r.cx_infection==='Yes'&&'Infect', r.cx_leadDislodge==='Yes'&&'Lead Dislodge', r.cx_mi==='Yes'&&'MI',
      ].filter(Boolean);
      const los = (r.admissionDate && r.dischargeDate) ? Math.round((new Date(r.dischargeDate)-new Date(r.admissionDate))/(1000*60*60*24))+' d' : '—';
      return [
        `${r.nameFirst||''} ${r.nameLast||''}`.trim()||'—', `${r.civilId||'—'}\n${r.fileNumber||'—'}`, r.admissionDate||'—',
        (r.gender||'—')[0]||'—', r.estimatedAge||'—', r.epReason||'—', (r.operatorName||'—').replace('Dr. ',''),
        r.procSuccess||'—', `${r.dischargeStatus||'—'}\n${r.dischargeDate||''}`, r.hx_afib||'—', r.hx_hf||'—',
        r.lvef||'—', cxList.length ? cxList.join(', ') : 'None', los
      ];
    })
  });
  doc.save(`MKH_Registry_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
};

window.exportSinglePDF = function(data) {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const ML = 12, MR = 12, CW = W - ML - MR;
  let y = 0;

  const fullName = `${data.nameFirst||''} ${data.nameMiddle||''} ${data.nameLast||''}`.trim() || 'Anonymous';

  doc.setFillColor(15,23,42); doc.rect(0,0,W,40,'F');
  doc.setFillColor(30,64,175); doc.rect(0,36,W,5,'F');
  doc.setFillColor(5,150,105); doc.rect(0,39,W,2,'F');

  doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.text('MUBARAK ALKABEER HOSPITAL', ML, 11);
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184); doc.text('Advanced Electrophysiology Registry', ML, 17);
  doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255); doc.text('PATIENT CLINICAL REPORT', ML, 27);
  doc.setFontSize(10); doc.setTextColor(96,165,250); doc.text(fullName, W-MR, 11, {align:'right'});
  doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184); doc.setFontSize(7.5);
  doc.text(`Civil ID: ${data.civilId||'—'}`, W-MR, 17, {align:'right'});
  doc.text(`File: ${data.fileNumber||'—'}  ·  CRF: ${data.crfNo||'—'}`, W-MR, 22, {align:'right'});
  doc.text(`Admitted: ${data.admissionDate||'—'}`, W-MR, 27, {align:'right'});

  y = 48;

  function checkPage(needed=10) {
    if(y + needed > H - 14) {
      doc.addPage();
      doc.setFillColor(30,64,175); doc.rect(0,0,W,9,'F');
      doc.setFontSize(7); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
      doc.text(`MKH EP Registry  ·  ${fullName}  ·  File: ${data.fileNumber||'—'}`, ML, 6);
      y = 14;
    }
  }

  function sectionHeader(title, rgb) {
    checkPage(14);
    doc.setFillColor(...rgb); doc.roundedRect(ML, y, CW, 8, 1.5, 1.5, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
    doc.text(title, ML+4, y+5.5);
    y += 12;
  }

  function fieldRow2Col(fields, rowIdx) {
    const rowH = 6.8;
    checkPage(rowH);
    if(rowIdx%2===0) { doc.setFillColor(247,249,252); doc.rect(ML,y,CW,rowH,'F'); }
    doc.setDrawColor(226,232,240); doc.setLineWidth(0.1);
    doc.line(ML+CW/2, y+1, ML+CW/2, y+rowH-1); doc.line(ML, y+rowH, ML+CW, y+rowH);

    for(let col=0; col<2; col++) {
      const f = fields[col]; if(!f) break;
      const lbl = FIELD_MAP[f] || f;
      const val = _fmtVal(data[f]);
      doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(100,116,139);
      doc.text(lbl, ML + col*(CW/2) + 2, y+4.5, {maxWidth:CW/2-20});
      doc.setFont('helvetica','normal'); doc.setTextColor(15,23,42);
      if(val==='✔ Yes') doc.setTextColor(5,150,105); else if(val==='No') doc.setTextColor(156,163,175);
      doc.text(val, ML + (col+1)*(CW/2) - 2, y+4.5, {align:'right', maxWidth:CW/2-24});
    }
    y += rowH;
  }

  PDF_SECTIONS.forEach(sec => {
    sectionHeader(sec.title, sec.color);
    const validFields = sec.fields.filter(f => data[f] !== undefined && data[f] !== null && data[f] !== '' && data[f] !== false && data[f] !== 'false');
    if(!validFields.length) { y+=8; } 
    else { for(let i=0; i<validFields.length; i+=2) fieldRow2Col([validFields[i], validFields[i+1]], Math.floor(i/2)); }
    y += 5;
  });

  const safeName = fullName.replace(/[^a-zA-Z0-9]/g,'_').slice(0,22);
  doc.save(`MKH_Patient_${safeName}_${new Date().toISOString().slice(0,10)}.pdf`);
};

// ============================================================
// ANALYTICS DASHBOARD
// ============================================================
window.toggleAnalytic = function(key) {
    const body=document.getElementById('body_'+key), chev=document.getElementById('chev_'+key);
    const isOpen=body.classList.contains('open');
    body.classList.toggle('open',!isOpen); chev.classList.toggle('open',!isOpen);
    if(!isOpen&&charts[key+'Chart']) setTimeout(()=>charts[key+'Chart'].resize(),50);
};
let charts={};
function mkChart(id,type,labels,data,colors){
    if(charts[id]) charts[id].destroy();
    const canvas=document.getElementById(id); if(!canvas) return;
    charts[id]=new Chart(canvas,{type,data:{labels,datasets:[{data,backgroundColor:colors,borderWidth:type==='bar'?0:2,borderColor:'#fff'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:type==='bar'?'top':'bottom',labels:{font:{size:11},boxWidth:12,padding:8}}},
    scales:type==='bar'?{y:{beginAtZero:true,ticks:{stepSize:1,font:{size:10}},grid:{color:'#f1f5f9'}},x:{ticks:{font:{size:10},maxRotation:35}}}:{}}});
}
window.fetchAnalytics = async function() {
    const snapshot=await getDocs(collection(window._db,"patients_full"));
    const rows=[]; snapshot.forEach(docSnap=>rows.push(docSnap.data()));
    const total=rows.length; if(!total){alert('No data yet.');return;}
    const successCount=rows.filter(r=>r.procSuccess==='Yes').length;
    const afibCount=rows.filter(r=>r.hx_afib==='Yes').length;
    const compCount=rows.filter(r=>r.cx_stroke==='Yes'||r.cx_bleeding==='Yes'||r.cx_tamponade2==='Yes'||r.cx_pneumothorax==='Yes'||r.cx_cardShock==='Yes'||r.cx_renal==='Yes').length;
    
    document.getElementById('kpi_total').textContent=total;
    document.getElementById('kpi_success').textContent=total?`${Math.round(successCount/total*100)}%`:'—';
    document.getElementById('kpi_complications').textContent=total?`${Math.round(compCount/total*100)}%`:'—';
    document.getElementById('kpi_afib').textContent=total?`${Math.round(afibCount/total*100)}%`:'—';
    
    const m=rows.filter(r=>r.gender==='Male').length, f=rows.filter(r=>r.gender==='Female').length;
    mkChart('genderChart','doughnut',['Male','Female'],[m,f],['#3b82f6','#ec4899']);
    
    const procCounts={}; rows.forEach(r=>{if(r.epReason) procCounts[r.epReason]=(procCounts[r.epReason]||0)+1;});
    mkChart('procChart','pie',Object.keys(procCounts),Object.values(procCounts),['#10b981','#6366f1','#f59e0b','#ef4444','#8b5cf6']);
    
    const disch={}; rows.forEach(r=>{if(r.dischargeStatus) disch[r.dischargeStatus]=(disch[r.dischargeStatus]||0)+1;});
    mkChart('dischargeChart','doughnut',Object.keys(disch),Object.values(disch),['#22c55e','#3b82f6','#f97316','#ef4444','#94a3b8']);
    
    const comorb=[
        {label:'AFib',val:rows.filter(r=>r.hx_afib==='Yes').length},{label:'HTN',val:rows.filter(r=>r.hx_htn==='Yes').length},
        {label:'DM',val:rows.filter(r=>r.hx_dm==='Yes').length},{label:'CAD',val:rows.filter(r=>r.hx_cad==='Yes').length},
        {label:'HF',val:rows.filter(r=>r.hx_hf==='Yes').length},{label:'Prior MI',val:rows.filter(r=>r.hx_mi==='Yes').length},
        {label:'CVD',val:rows.filter(r=>r.hx_cvd==='Yes').length},{label:'Dialysis',val:rows.filter(r=>r.hx_dialysis==='Yes').length},
    ].sort((a,b)=>b.val-a.val);
    mkChart('comorbChart','bar',comorb.map(c=>c.label),comorb.map(c=>c.val),comorb.map((_,i)=>`hsl(${210+i*18},75%,55%)`));
    
    const comps=[
        {label:'Stroke',val:rows.filter(r=>r.cx_stroke==='Yes').length},{label:'Bleeding',val:rows.filter(r=>r.cx_bleeding==='Yes').length},
        {label:'Tamponade',val:rows.filter(r=>r.cx_tamponade2==='Yes').length},{label:'Pneumothorax',val:rows.filter(r=>r.cx_pneumothorax==='Yes').length},
        {label:'Renal',val:rows.filter(r=>r.cx_renal==='Yes').length},{label:'Card.Shock',val:rows.filter(r=>r.cx_cardShock==='Yes').length},
        {label:'Vascular',val:rows.filter(r=>r.cx_vascular==='Yes').length},{label:'Peri.Effusion',val:rows.filter(r=>r.cx_periEff==='Yes').length},
    ].filter(c=>c.val>0).sort((a,b)=>b.val-a.val);
    mkChart('compChart','bar',comps.length?comps.map(c=>c.label):['No complications'],comps.length?comps.map(c=>c.val):[0],comps.map((_,i)=>`hsl(${0+i*22},75%,55%)`));
    
    const ciedMap={
        'Single PPM':rows.filter(r=>r.cied_single===true||r.cied_single==='true').length,
        'Dual PPM':rows.filter(r=>r.cied_dual===true||r.cied_dual==='true').length,
        'CRT-D':rows.filter(r=>r.cied_crtd===true||r.cied_crtd==='true').length,
        'ICD Single':rows.filter(r=>r.cied_icdSingle===true||r.cied_icdSingle==='true').length,
        'ICD Dual':rows.filter(r=>r.cied_icdDual===true||r.cied_icdDual==='true').length,
        'S-ICD':rows.filter(r=>r.cied_sicd===true||r.cied_sicd==='true').length,
        'CRT-P':rows.filter(r=>r.cied_crtp===true||r.cied_crtp==='true').length,
    };
    const ciedF=Object.entries(ciedMap).filter(([,v])=>v>0);
    mkChart('ciedChart','doughnut',ciedF.length?ciedF.map(e=>e[0]):['No data'],ciedF.length?ciedF.map(e=>e[1]):[1],['#6366f1','#3b82f6','#ec4899','#f59e0b','#10b981','#ef4444','#8b5cf6']);
};
