import socket

ip_list = []
ais = socket.getaddrinfo("guard.gridgig.com",0,0,0,0)
for result in ais:
  ip_list.append(result[-1][0])
ip_list = list(set(ip_list))
