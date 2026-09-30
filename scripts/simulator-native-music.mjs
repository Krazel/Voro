import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const out='artifact/native-music-qa';fs.mkdirSync(out,{recursive:true});
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:40*1024*1024,timeout:300000});if(cmd==='xcodebuild')fs.writeFileSync(out+'/compile.log',r.stdout+r.stderr);assert.equal(r.status,0,(r.stdout+r.stderr).split('\n').filter(l=>/error:|warning:|BUILD FAILED|failed:/.test(l)).join('\n').slice(-10000)||(r.stdout+r.stderr).slice(-5000));return r.stdout.trim();};
const probe='ios/App/App/public/native-music-probe.js',derived=path.join(process.env.RUNNER_TEMP,'VoroNativeMusicQA');
fs.copyFileSync('scripts/native-music-probe.js',probe);
try{
 const log=run('xcodebuild',['build','-project','ios/App/App.xcodeproj','-scheme','App','-configuration','Release','-sdk','iphonesimulator','-destination','generic/platform=iOS Simulator','-derivedDataPath',derived,'CODE_SIGNING_ALLOWED=NO']);fs.writeFileSync(out+'/compile.log',log);
 const all=JSON.parse(run('xcrun',['simctl','list','devices','available','--json'])).devices;
 const runtime=Object.keys(all).filter(k=>k.includes('iOS')).sort().at(-1),phone=all[runtime]?.find(d=>d.name.includes('iPhone'));assert(phone);
 if(phone.state!=='Booted')run('xcrun',['simctl','boot',phone.udid]);run('xcrun',['simctl','bootstatus',phone.udid,'-b']);
 run('xcrun',['simctl','install',phone.udid,path.join(derived,'Build/Products/Release-iphonesimulator/App.app')]);
 const container=run('xcrun',['simctl','get_app_container',phone.udid,'com.dmkr.voro','data']);
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 async function wait(name,check=()=>true){for(let i=0;i<90;i++){const file=path.join(container,'Documents','music-'+name+'.json');if(fs.existsSync(file)){const state=JSON.parse(fs.readFileSync(file));if(check(state)){fs.copyFileSync(file,out+'/music-'+name+'.json');return state;}}await sleep(1000);}throw Error('No native music result: '+name);}
 run('xcrun',['simctl','launch',phone.udid,'com.dmkr.voro','--voro-native-audio-smoke']);
 const menu=await wait('menu'),micro=await wait('micro'),muted=await wait('muted'),resumed=await wait('resumed');
 assert.equal(menu.backend,'AVAudioPlayer');assert.equal(menu.track,'menu');assert(menu.playing&&menu.time>1);
 assert.equal(micro.track,'micro');assert(micro.playing&&micro.time>4);assert.equal(micro.transition,false);
 assert.equal(muted.playing,false);assert.equal(resumed.track,'micro');assert(resumed.playing&&resumed.time>muted.time);assert(Math.abs(resumed.volume-.42)<.001);
 run('xcrun',['simctl','launch',phone.udid,'com.apple.mobilesafari']);
 const background=await wait('state',s=>!s.foreground);assert.equal(background.playing,false);
 run('xcrun',['simctl','launch',phone.udid,'com.dmkr.voro']);const foreground=await wait('foreground');assert(foreground.playing&&foreground.time>background.time);
 fs.writeFileSync(out+'/verification.json',JSON.stringify({commit:process.env.GITHUB_SHA,runtime,device:phone.name,physicalDevice:false,menu,micro,muted,resumed,background,foreground},null,2));
}finally{fs.unlinkSync(probe);}
