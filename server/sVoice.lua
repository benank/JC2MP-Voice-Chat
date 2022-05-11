class "sVoice"

function sVoice:__init()
    SQL:Execute("CREATE TABLE IF NOT EXISTS voice (steamID VARCHAR UNIQUE, voice_code VARCHAR)")

    self.voice_code_length = 10
    self.transmit_interval = 250
    self:StartTransmitLoop()

    Events:Subscribe("ClientModuleLoad", self, self.ClientModuleLoad)
    Network:Subscribe("Voice/GetNew", self, self.GetNewVoiceCode)
end

function sVoice:GetNewVoiceCode(args, player)
    local voice_code = self:GenerateNewVoiceCode()
    local steamID = tostring(player:GetSteamId())
    
    -- Delete old voice code, if it exists
    local cmd = SQL:Command("DELETE FROM voice WHERE steamID = (?)")
    cmd:Bind(1, steamID)
    cmd:Execute()
    
    -- Add new voice code
    local command = SQL:Command("INSERT INTO voice (steamID, voice_code) VALUES (?, ?)")
    command:Bind(1, steamID)
    command:Bind(2, voice_code)
    command:Execute()
    
    Network:Send(player, "Voice/VoiceCode", {voice_code = voice_code})
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
        local steamID = tostring(p:GetSteamId())
        local position = p:GetPosition()
        
        player_data[steamID] = {
            pos = {
                x = position.x,
                y = position.y,
                z = position.z
            },
            muted = p:GetValue("Voice/Muted") == true
        }
        
        if p:InVehicle() then
            player_data[steamID].v_id = p:GetVehicle():GetId()
        end
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
    
    Network:Send(args.player, "Voice/VoiceCode", {voice_code = voice_code})
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
