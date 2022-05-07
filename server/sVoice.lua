class "sVoice"

function sVoice:__init()
    SQL:Execute("CREATE TABLE IF NOT EXISTS voice (steamID VARCHAR UNIQUE, voice_code VARCHAR)")

    self.voice_code_length = 10
    self.transmit_interval = 1000
    self:StartTransmitLoop()

    Events:Subscribe("ClientModuleLoad", self, self.ClientModuleLoad)
end

function sVoice:StartTransmitLoop()
    Thread(
        function()
            while true do
                self:TransmitPlayerData()
                Timer.Sleep(self.transmit_interval)
            end
        end
    )
end

function sVoice:TransmitPlayerData()
    -- Transmit all player positions (and maybe more later) to JS server
    -- Player data indexed by steam id
    local player_data = {}

    for p in Server:GetPlayers() do
        local position = p:GetPosition()
        player_data[tostring(p:GetSteamId())] = {
            pos = {
                x = position.x,
                y = position.y,
                z = position.z
            },
            muted = p:GetValue("Voice/Muted") or false
        }
    end
    
    send({
        evt = "players_update",
        data = player_data
    })
end

function sVoice:ClientModuleLoad(args)
    local steamID = tostring(args.player:GetSteamId())

    local query = SQL:Query("SELECT voice_code FROM voice WHERE steamID = (?) LIMIT 1")
    query:Bind(1, steamID)
    local result = query:Execute()

    local voice_code
    if #result == 0 then
        voice_code = self:GenerateNewVoiceCode()
		local command = SQL:Command("INSERT INTO voice (steamID, voice_code) VALUES (?, ?)")
		command:Bind(1, steamID)
		command:Bind(2, voice_code)
		command:Execute()
    else
        voice_code = result[1].voice_code
    end

    -- Send to player, display in menu
    print("Voice code " .. voice_code)
end

function sVoice:RandomString(length)
    local res = ""
    for i = 1, self.voice_code_length do
        res = res .. string.char(math.random(65, 90))
    end
    return res
end

function sVoice:GenerateNewVoiceCode()
    math.randomseed(os.clock() ^ 5)
    local voice_code = self:RandomString(self.voice_code_length)

    -- check to make sure it doesn't exist in db already
    local query = SQL:Query("SELECT * FROM voice WHERE voice_code = (?) LIMIT 1")
    query:Bind(1, voice_code)
    local result = query:Execute()

    if #result == 0 then
        return voice_code
    else
        return self:GenerateNewVoiceCode()
    end
end

sVoice()
