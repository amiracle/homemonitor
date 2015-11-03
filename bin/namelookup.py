#from socket import gethostbyaddr 
import socket

def nslooky(ip):
      try: 
           output = gethostbyaddr(ip)
           return output[0]
     except: 
           output = "not found" 
           return ".join(output[2])"

 your_ip = request.META.get('REMOTE_ADDR') 
# above is Django module object
 your_name = nslooky(your_ip)
