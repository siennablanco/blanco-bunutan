# 🎄 Online Bunutan - Christmas Monito-Monita Web App 🎁

Isang cute at masayang Christmas Web App para sa online bunutan (Secret Santa / Monito-Monita) na espesyal na dinisenyo para sa pamilya at magkakaibigan—lalo na kapag **iisang cellphone lang ang iniikot sa sala o hapag-kainan!**

---

## ✨ Mga Tampok (Key Features)

1. **📱 Single-Device Family Mode (Pasa-pasahan ng Cellphone)**
   - Piliin ang pangalan mula sa listahan.
   - May kumpirmasyon bago bumunot upang makaiwas sa maling pindot.
   - May suspense drum roll at shaking gift box animation bago lumabas ang pangalan!
   - Confetti explosion + fanfare jingle pagkabunot!
   - **"Tapos na ako! Ipasa sa susunod"** button: Agad na itinatago ang resulta at minamarkahan ang nakabunot na bilang tapos na, para walang silipan!

2. **👑 Organizer Dashboard (PIN-Protected: default `1234`)**
   - **Add Participants**: Isahang dagdag na may optional wishlist o **Bulk Add** (i-paste ang mga pangalan nang may comma o bawat linya).
   - **Exclusions (Bawal Mabunot)**:
     - **Quick Mag-asawa / Partners Setup**: Sa isang click lang, bawal nang mabunot ng mag-asawa ang isa't isa!
     - **Custom Exclusions**: Piliin kung sinu-sino ang bawal mabunot ng bawat indibidwal.
     - Hindi kailanman mabubunot ang sarili.
   - **Smart Secret Santa Matching Engine**: Backtracking solver na gumagarantiya na bawat isa ay may magbibigay at makakatanggap, walang deadlock, at walang maiiwan.
   - **Progress Tracking & Master List**:
     - Kita ng organizer kung sino na ang nakabunot at sino pa ang hindi.
     - May sikretong Master List backup kung sakaling makalimutan ng isang kalahok ang kanyang nabunot.
     - Pwedeng i-reset o i-shuffle muli kung kailangan.

3. **🎶 Festive Christmas Theme & Party Background Music**
   - Built-in Web Audio API Christmas Party synthesizer na tumutugtog ng masasayang party holiday medley (*Jingle Bells*, *We Wish You a Merry Christmas*, at *Joy to the World*) nang hindi nangangailangan ng panlabas na MP3 download!
   - May kasamang Sound Effects (SFX): drum roll, confetti fanfare, jingle bells, at pop sound!
   - Floating cute music player sa ibabang bahagi na may volume slider at mute button.

4. **❄️ Cute Holiday Aesthetics**
   - Kumikislap na Christmas garland lights sa itaas.
   - Umuulang niyebe (falling snow particles).
   - Cute typography gamit ang Google Fonts (*Mountains of Christmas* & *Fredoka*).
   - Buong suporta sa mobile at tablet view.

---

## 🚀 Paano Patakbuhin (How to Run)

```bash
# 1. Install dependencies
npm install

# 2. Simulan ang server
npm run dev

# 3. I-build para sa production (deployable sa Vercel / Netlify / GitHub Pages)
npm run build
```

Buksan ang browser sa:
- Local: `http://localhost:5174/`
- Sa Ibang Cellphone sa Bahay (same Wi-Fi): `http://192.168.100.158:5174/`

