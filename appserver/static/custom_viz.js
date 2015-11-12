require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'app/homemonitor/components/tagcloud/tagcloud',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, TagCloud, SearchManager, utils){

    new SearchManager({
        "id": 'homemonitor1',
        "search": 'index=main sourcetype=stream* app=http host="ghost.gridgig.com"  dest_port=80 http_comment="HTTP/1.1 200 OK" NOT dest_ip=192.168.1.129 OR NOT dest_ip=192.168.1.1| eval fq_domain=split(site,".") | eval domain=mvindex(fq_domain,-2) | stats count by domain',
        "earliest_time": "-24h",
        "latest_time": "now",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "status_buckets": 0,
        "preview": true,
        "timeFormat": "%s.%Q",
        "wait": 0,
        "runOnSubmit": true
    });

    new TagCloud({
        id: 'homemonitor1',
        managerid: 'homemonitor1',
        labelField: 'domain',
        valueField: 'count',
        el: $('#custom')
    }).render();

});
