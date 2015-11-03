###
###
### Home Monitor 3.1.3 README 
###
###

How this app works: 

This version of the app can either rely on your router's hostname to configure the sourcetype, or you can select it manually on the Data Inputs page. For example, if you have a fios router, and the hostname is fios, then the props.conf and transforms.conf will work together to change the sourcetype to fios.  (The reason I did this was that it helepd during my testing having Splunk automatically pickup and change the sourcetype on the fly for me.) 

Once the data input is in (more on that below), you will be able to see all of the dashboards populate with your data.  I even normalized the fields and the output of some of the fields using a lookup. This allows my Asus router and my pfSense firewall to have the same output as my FiOS router. You'll see that there are two fields, 'action' and 'action2' in the interesting fields.  The lookup, named action_lookup.csv, will convert the action to a normalized BLOCK or ACCEPT instead of DROP or pass. This allows all the dashboards to populate regardless of your router. There are some dashboards that WILL NOT populate since they have FiOS specific fields in the search.


What's new: 

	1) Data Input - When onboarding your data source, you'll need to first enable the Data Input and then decide if you want to Splunk automatically sourcetype your data based on your router's hostname.  You can also manually change the sourcetype to fios, asus, pfsense, netgear or skyhub. 

	2) Lookup - The lookup, action_lookup.csv, is meant to help normalize the action of the firewall so that all the dashboards will populate regardless of what router you have.

	3) New updated dashboards - I've gone through and vetted all the dashboards to make sure they make some logical sense.  I stopped using the 'process' field since it did not exist in all the routers syslog data.  Instead, I determined that outbound connections were iniated by src_ip = 192.168.* and inbound connections were iniated by NOT src_ip=192.168.* .  


What might need to be done:

I was thinking about creating a setup page, so more advanced users can configure the app to suite their customized networks.  When I get more motivation, I'll work on setting up tags for local networks and a setup page that allows you to change some of the inputs or specify your local network IP address space. 

Note:
 
If you're going to make changes to the default dashbaords and reports, you can place them here so that any upgrades will not effect your custom dashboards. 

Thanks to everyone for your input and feedback, please keep it coming! You are all helping make this app what it is today.  

-Kamilo "Kam" Amir
