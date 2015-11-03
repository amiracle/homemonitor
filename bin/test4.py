import os, re, subprocess
 
nslkp_domain = 'guard.gridgig.com'
nslkp_type = 'NS'
nslkp = 'nslookup'
out = subprocess.Popen([nslkp ,'-type='+nslkp_type ,nslkp_domain],stdout=subprocess.PIPE).communicate()[0]
 
result = out.split("\n")
nslkp_result=[]
for data in result:
    if re.search('nameserver', data):
        data = data.split(" ")
        nslkp_result.append(data[2])
 
print('Nameservers for domain :', nslkp_domain)
for ns in nslkp_result:
    print(ns)
