class 'cVoice'

function cVoice:__init()
    self.voice_code = ""
    self.press_timer = Timer()
    self:CreateWindow()
    Events:Subscribe("LocalPlayerChat", self, self.LocalPlayerChat)
    Network:Subscribe("Voice/VoiceCode", self, self.GetVoiceCode)
end

function cVoice:GetVoiceCode(args)
    self.voice_code = args.voice_code
    self.vc_input:SetText(self.voice_code)
end

function cVoice:ShowWindow()
    self:HideWindow()
    self.lpi = Events:Subscribe("LocalPlayerInput", self, self.LocalPlayerInput)
    self.window:Show()
    Mouse:SetVisible(true)
end

function cVoice:LocalPlayerInput()
    return false
end

function cVoice:LocalPlayerChat(args)
    if args.text == "/voice" then
        self:ShowWindow()
    end
end

function cVoice:CreateWindow()
    
    self.window = Window.Create()
    self.window:SetTitle("Ingame Proximity Voice Chat")
    self.window:DisableResizing()
    self.window:SetClampMovement(true)
    self.window:Hide()
    self.window:SetSize(Vector2(400, 300))
    self.window:SetPosition(Vector2(Render.Size.x / 2, Render.Size.y / 2) - self.window:GetSize() / 2)
    self.window:Subscribe("WindowClosed", self, self.HideWindow)
    
    self.guide_text = Label.Create(self.window)
    self.guide_text:SetAlignment(GwenPosition.Fill)
    self.guide_text:SetText(
        "Voice Chat Instructions\n\n"..
        "1. Copy your Voice Code below.\n"..
        "    Do not share your Voice Code with anyone.\n"..
        "2. Go to: panausurvival.com\n"..
        "3. Follow the instructions there and use your Voice Code\n to connect.\n\n"
    )
    self.guide_text:SetTextColor(Color.White)
    self.guide_text:SetTextSize(16)
    self.guide_text:SetPosition(Vector2(10, 10))
    self.guide_text:SetSizeRel(Vector2(1,1))
    self.guide_text:SetFont(AssetLocation.Disk, "Archivo.ttf")
    
    self.vc_text = Label.Create(self.window)
    self.vc_text:SetAlignment(GwenPosition.Center)
    self.vc_text:SetText("Voice Code")
    self.vc_text:SetTextColor(Color.White)
    self.vc_text:SetTextSize(28)
    self.vc_text:SetPosition(Vector2(0, 15))
    self.vc_text:SetSizeRel(Vector2(1,1))
    self.vc_text:SetFont(AssetLocation.Disk, "Archivo.ttf")
    
    self.vc_input = TextBox.Create(self.window)
    self.vc_input:SetTextSize(34)
    self.vc_input:SetMargin(Vector2(4, 4), Vector2(4, 4))
    self.vc_input:SetSizeRel(Vector2(1, 0.2))
    self.vc_input:SetText(self.voice_code)
    self.vc_input:SetAlignment(GwenPosition.Center)
    self.vc_input:SetPositionRel(Vector2(0, 0.65))
    self.vc_input:SetFont(AssetLocation.Disk, "Archivo.ttf")
    self.vc_input:SetBackgroundVisible(false)
    self.vc_input:SetTextColor(Color.Orange)
    self.vc_input:Subscribe("TextChanged", self, self.TextChanged)
    
    self.get_new_button = Button.Create(self.window)
    self.get_new_button:SetAlignment(GwenPosition.Center)
    self.get_new_button:SetText("Get New Code")
    self.get_new_button:SetTextColor(Color.White)
    self.get_new_button:SetTextSize(14)
    self.get_new_button:SetPadding(Vector2(4, 4), Vector2(4, 4))
    self.get_new_button:SetFont(AssetLocation.Disk, "Archivo.ttf")
    self.get_new_button:SetPositionRel(Vector2(0.75, 0))
    self.get_new_button:Subscribe("Press", self, self.PressNewCodeButton)

end

function cVoice:PressNewCodeButton()
    if self.press_timer:GetSeconds() < 1 then return end
    self.press_timer:Restart()
    Network:Send("Voice/GetNew")
end

function cVoice:TextChanged()
    self.vc_input:SetText(self.voice_code)
end

function cVoice:HideWindow()
    if self.lpi then
        self.lpi = Events:Unsubscribe(self.lpi)
    end
    Mouse:SetVisible(false)
    self.window:Hide()
end

function cVoice:PressButton(btn)
    self:HideWindow()
    Network:Send("SetLanguage", {locale = locale})
end


cVoice()