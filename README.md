Splunk app for home | monitor >
===========

Author: Kamilo Amir

Version: 5.0.0
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

1) Created indexes macro so people can either use their own index or keep the data in the main index. Update the `homemonitor_index` macro to include or remove indexes.

2) Added support for the 'Ajit-Pi Project' to help monitor for the impact of net neutrality on your local network. 

3) Created TA_HomeMonitor for distributed environments, this will allow users to have the TA's collect data from their forwarders / syslog servers and send them into their Splunk servers. 

Wishlist :

Create Bad IP collection (mongoDB) to keep track of bad IP’s and domains hitting routers.

Note:

If you're going to make changes to the default dashbaords and reports, you can place them here so that any upgrades will not effect your custom dashboards.

======

Thanks to everyone for your input and feedback, please keep it coming! You are all helping make this app what it is today.

-Kamilo "Kam" Amir
