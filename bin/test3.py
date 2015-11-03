import dns.resolver

answers = dns.resolver.query('guard.gridgig.com', 'A')
for rdata in answers:
    print 'Host', rdata.exchange, 'has preference', rdata.preference
