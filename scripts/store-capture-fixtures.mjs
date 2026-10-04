// Capture-only native harness. Never invoked by build:mobile, ios:sync or TestFlight.
// The packaged web game stays identical to the uploaded release candidate.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {newJourney,journeyLife,saveJourney,JOURNEY_SAVE} from '../app/journey-progress.mjs';
import {radiusForMass} from '../app/simulation.mjs';
const fixtures={};
for(const [name,stage,factor] of [['micro',0,2.1],['sea',3,5],['city',4,3.5],['planets',6,2.5]]){
 const progress=newJourney(834);progress.stage=stage;
 const life=journeyLife(progress);life.biomass*=factor;life.radius=radiusForMass(life.biomass);
 fixtures[name]=saveJourney(progress,life,{journal:new Map()},true);
}
const statements=Object.entries(fixtures).map(([name,value])=>
 `case ${JSON.stringify(name)}: seed = ${JSON.stringify(value)}`).join('\n');
const path='ios/App/App/SceneDelegate.swift';
let source=fs.readFileSync(path,'utf8');
if(!source.includes('override func capacitorDidLoad() {'))throw Error('Capture insertion point changed');
const injection=`
        // Simulator capture fixture only; not present in the signed release.
        if let stage = ProcessInfo.processInfo.environment["VORO_CAPTURE_STAGE"],
           let webView = bridge?.webView {
            let seed: String
            switch stage {
            ${statements}
            default: seed = ""
            }
            let data = try! JSONSerialization.data(withJSONObject: [seed])
            let literal = String(data: data, encoding: .utf8)!
            let js = "localStorage.removeItem('${JOURNEY_SAVE}');let s=\\(literal)[0];if(s)localStorage.setItem('${JOURNEY_SAVE}',s);"
            webView.configuration.userContentController.addUserScript(WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true))
            webView.reload()
        }
`;
source='import WebKit\n'+source.replace('override func capacitorDidLoad() {','override func capacitorDidLoad() {'+injection);
fs.writeFileSync(path,source);
const files=[];
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())walk(p);else files.push({path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')});}}
walk('ios/App/App/public');
fs.mkdirSync('artifact/native-captures',{recursive:true});
fs.writeFileSync('artifact/native-captures/fixture-provenance.json',JSON.stringify({sourceCommit:'b1285d832684ef203dad1906db767e0d8f7d57d2',modifiedNativeFile:path,webCodeUnmodified:true,fixtures:Object.keys(fixtures),files},null,2));
