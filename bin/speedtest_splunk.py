# 
# This code was used in conjunction with the speedtest-cli repo listed here : https://github.com/sivel/speedtest-cli
# The second part of this script was put together using this repo as a template : http://pastebin.com/WMEh802V
#
# This script is given out AS IS.
#
# Kamilo Amir 02/03/2016

#!/usr/bin/python
import os
import sys
import datetime
import time

def test():

        #run speedtest-cli
        #print 'running test'
        a = os.popen("python speedtest_cli.py --simple").read()
        #print 'ran'
        #split the 3 line result (ping,down,up)
        lines = a.split('\n')
        #print a
        ts = time.time()
        date =datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
        #if speedtest could not connect set the speeds to 0
        if "Cannot" in a:
                p = 100
                d = 0
                u = 0
        #extract the values for ping down and up values
        else:
                p = lines[0][6:11]
                d = lines[1][10:14]
                u = lines[2][8:12]
        print date,p, d, u

if __name__ == '__main__':
        test()
        #print 'completed'
