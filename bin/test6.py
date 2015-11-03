import socket
import sys,splunk.Intersplunk
results = []

try:
	host=socket.getfqdn(ip)
	print host
except socket.gaierror,err:
	print "cannot resolve hostname: ",ip,err
