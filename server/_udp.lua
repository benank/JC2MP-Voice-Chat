local json = require("json")
local encode, decode = json.encode, json.decode
-- change here to the host an port you want to contact
local host, port = "localhost", 4002
-- load namespace
local socket = require("socket")
-- convert host name to ip address
local ip = assert(socket.dns.toip(host))
-- create a new UDP object
local udp = assert(socket.udp())
assert(udp:settimeout(0))

function send(content)
    assert(udp:sendto(tostring(encode{content}), ip, port))
end
