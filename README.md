Splunk app for home | monitor >
===========

Author: Kamilo Amir

Version: 4.5.0
=======
Home Monitor App for Splunk

- App Location: https://apps.splunk.com/app/1214/
- Wiki : https://github.com/amiracle/homemonitor/wiki/Welcome-to-the-home-monitor-app-for-Splunk-wiki
- Blog posts : http://amiracle19.blogspot.com/2012/09/home-monitor-for-splunk-v10.html

Welcome to Home Monitor for Splunk! This tool will allow you to visualize the traffic that is coming to your home modem (DSL, FiOS or other).  You only have to point the syslog information to your instance of Splunk and you'll be able to immediately be able to see the data flowing in. The contents of this repository include the setup screen shots located in the html and img directories.  Please use them as a quick reference guide in setting up your Verizon FiOS router.  

How this app works:

This version of the app can either rely on your router's hostname to configure the sourcetype, or you can select it manually on the Data Inputs page. For example, if you have a fios router, and the hostname is fios, then the props.conf and transforms.conf will work together to change the sourcetype to fios.  (The reason I did this was that it helepd during my testing having Splunk automatically pickup and change the sourcetype on the fly for me.)

Once the data input is in (more on that below), you will be able to see all of the dashboards populate with your data.  I even normalized the fields and the output of some of the fields using a lookup. This allows my Asus router and my pfSense firewall to have the same output as my FiOS router. You'll see that there are two fields, 'action' and 'action2' in the interesting fields.  The lookup, named action_lookup.csv, will convert the action to a normalized BLOCK or ACCEPT instead of DROP or pass. This allows all the dashboards to populate regardless of your router. There are some dashboards that WILL NOT populate since they have FiOS specific fields in the search.


What's new:

1) Data Input - When onboarding your data source, you'll need to first enable the Data Input and then decide if you want to Splunk automatically sourcetype your data based on your router's hostname.  You can also manually change the sourcetype to fios, asus, pfsense, netgear or skyhub.

2) Lookup - The lookup, action_lookup.csv, is meant to help normalize the action of the firewall so that all the dashboards will populate regardless of what router you have.

3) New updated dashboards - I've gone through and vetted all the dashboards to make sure they make some logical sense.  I stopped using the 'process' field since it did not exist in all the routers syslog data.  Instead, I determined that outbound connections were iniated by src_ip = 192.168.* and inbound connections were iniated by NOT src_ip=192.168.* .

4) New support for pfSense 2.2.x - This will now support pfSense firewalls version 2.2.1 and beyond with the latest version of logging.  The older version of pfSense firewalls will no longer be supported.

5) Added new Macros that help with private IP's for both source and destination IP addresses.

Wishlist :

Create Bad IP collection (mongoDB) to keep track of bad IP’s and domains hitting routers.

Note:

If you're going to make changes to the default dashbaords and reports, you can place them here so that any upgrades will not effect your custom dashboards.

======

Thanks to everyone for your input and feedback, please keep it coming! You are all helping make this app what it is today.

-Kamilo "Kam" Amir
