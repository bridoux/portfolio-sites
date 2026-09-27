#!/usr/bin/env bash
# Polls until the newest production deployment of each project is READY or ERROR (max ~10 min).
PROJECTS="aurele-horlogerie ember-and-stack kestrel-orbital togen-tea-house subsoniq-festival eric-bridoux"
for i in $(seq 1 40); do
  out=$(tools/vercel-api.sh GET "/v6/deployments?limit=40&target=production" | node -e "
    let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
      const j=JSON.parse(d.replace(/\nHTTP \d+\n?$/,''));const want='$PROJECTS'.split(' ');const seen={};
      for(const x of j.deployments){ if(want.includes(x.name)&&!seen[x.name]) seen[x.name]=x }
      const rows=want.map(n=>{const x=seen[n];return n.padEnd(20)+' '+(x?x.state:'none').padEnd(9)+' '+(x?x.url:'')})
      const done=want.every(n=>seen[n]&&['READY','ERROR','CANCELED'].includes(seen[n].state))
      console.log((done?'DONE':'WAIT')+'\n'+rows.join('\n'))})")
  if [[ "$out" == DONE* ]]; then echo "$out"; exit 0; fi
  sleep 15
done
echo "TIMEOUT"; echo "$out"
