/**
 * Mock static playlists — used as fallback when backend is offline.
 * 4 playlists:
 *   1. Local   – all songs combined
 *   2. Telugu  – Telugu movie songs
 *   3. Hindi   – Hindi / Bollywood songs
 *   4. English – English / international songs
 */

// ─── Telugu songs (from MOCK_ALBUMS) ───────────────────────────────────────
const TELUGU_SONGS = [
  // Ye Maaya Chesave
  { id: 'ymc1', name: 'Aaromale', duration: 338, coverImage: '/static/images/ye_maaya_chesave.jpg', audioUrl: '/static/audio/aaromale.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'ye_maaya_chesave', name: 'Ye Maaya Chesave' } },
  { id: 'ymc2', name: 'Ee Hridayam', duration: 324, coverImage: '/static/images/ye_maaya_chesave.jpg', audioUrl: '/static/audio/ee_hridayam.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'ye_maaya_chesave', name: 'Ye Maaya Chesave' } },
  { id: 'ymc3', name: 'Kundanapu Bomma', duration: 300, coverImage: '/static/images/ye_maaya_chesave.jpg', audioUrl: '/static/audio/kundanapu_bomma.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'ye_maaya_chesave', name: 'Ye Maaya Chesave' } },
  { id: 'ymc4', name: 'Manasaa', duration: 248, coverImage: '/static/images/ye_maaya_chesave.jpg', audioUrl: '/static/audio/manasaa.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'ye_maaya_chesave', name: 'Ye Maaya Chesave' } },
  { id: 'ymc5', name: 'Swaasye', duration: 190, coverImage: '/static/images/ye_maaya_chesave.jpg', audioUrl: '/static/audio/swaasye.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'ye_maaya_chesave', name: 'Ye Maaya Chesave' } },
  { id: 'ymc6', name: 'Vintunnavaa', duration: 408, coverImage: '/static/images/ye_maaya_chesave.jpg', audioUrl: '/static/audio/vintunnavaa.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'ye_maaya_chesave', name: 'Ye Maaya Chesave' } },
  // Rangasthalam
  { id: 'ran1', name: 'Rangamma Mangamma', duration: 264, coverImage: '/static/images/rangasthalam.jpg', audioUrl: '/static/audio/rangamma_mangamma.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'rangasthalam', name: 'Rangasthalam' } },
  { id: 'ran2', name: 'Aa Gattununtaava', duration: 207, coverImage: '/static/images/rangasthalam.jpg', audioUrl: '/static/audio/aa_gattununtaava.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'rangasthalam', name: 'Rangasthalam' } },
  { id: 'ran3', name: 'Jigelu Rani', duration: 307, coverImage: '/static/images/rangasthalam.jpg', audioUrl: '/static/audio/jigelu_rani.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'rangasthalam', name: 'Rangasthalam' } },
  { id: 'ran4', name: 'Orayyo', duration: 339, coverImage: '/static/images/rangasthalam.jpg', audioUrl: '/static/audio/orayyo.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'rangasthalam', name: 'Rangasthalam' } },
  { id: 'ran5', name: 'Ranga Ranga', duration: 319, coverImage: '/static/images/rangasthalam.jpg', audioUrl: '/static/audio/ranga_ranga.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'rangasthalam', name: 'Rangasthalam' } },
  { id: 'ran6', name: 'Yentha Sakkagunnave', duration: 281, coverImage: '/static/images/rangasthalam.jpg', audioUrl: '/static/audio/yentha_sakkagunnave.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'rangasthalam', name: 'Rangasthalam' } },
  // Arya
  { id: 'ary1', name: 'Feel My Love', duration: 290, coverImage: '/static/images/arya.jpg', audioUrl: '/static/audio/feel_my_love.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'arya', name: 'Arya' } },
  { id: 'ary2', name: 'Nuvvunte', duration: 309, coverImage: '/static/images/arya.jpg', audioUrl: '/static/audio/nuvvunte.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'arya', name: 'Arya' } },
  { id: 'ary3', name: 'You Rock My World', duration: 294, coverImage: '/static/images/arya.jpg', audioUrl: '/static/audio/you_rock_my_world.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'arya', name: 'Arya' } },
  { id: 'ary4', name: 'O My Brotheru', duration: 297, coverImage: '/static/images/arya.jpg', audioUrl: '/static/audio/o_my_brotheru.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'arya', name: 'Arya' } },
  { id: 'ary5', name: 'Thakadimithom', duration: 325, coverImage: '/static/images/arya.jpg', audioUrl: '/static/audio/thakadimithom.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'arya', name: 'Arya' } },
  { id: 'ary6', name: 'Aa Ante Amalapuram', duration: 295, coverImage: '/static/images/arya.jpg', audioUrl: '/static/audio/aa_ante_amalapuram.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'arya', name: 'Arya' } },
  // Ala Vaikunthapurramuloo
  { id: 'av1', name: 'Buttabomma', duration: 198, coverImage: '/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: '/static/audio/buttabomma.mp3', artist: { id: 'a10', name: 'Thaman S' }, album: { id: 'ala_vaikunthapurramuloo', name: 'Ala Vaikunthapurramuloo' } },
  { id: 'av2', name: 'Samajavaragamana', duration: 214, coverImage: '/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: '/static/audio/samajavaragamana.mp3', artist: { id: 'a10', name: 'Thaman S' }, album: { id: 'ala_vaikunthapurramuloo', name: 'Ala Vaikunthapurramuloo' } },
  { id: 'av3', name: 'Ramuloo Ramula', duration: 240, coverImage: '/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: '/static/audio/ramuloo_ramula.mp3', artist: { id: 'a10', name: 'Thaman S' }, album: { id: 'ala_vaikunthapurramuloo', name: 'Ala Vaikunthapurramuloo' } },
  { id: 'av4', name: 'OMG Daddy', duration: 220, coverImage: '/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: '/static/audio/omg_daddy.mp3', artist: { id: 'a10', name: 'Thaman S' }, album: { id: 'ala_vaikunthapurramuloo', name: 'Ala Vaikunthapurramuloo' } },
  { id: 'av5', name: 'Samajavaragamana (Female)', duration: 255, coverImage: '/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: '/static/audio/samajavaragamana_female.mp3', artist: { id: 'a10', name: 'Thaman S' }, album: { id: 'ala_vaikunthapurramuloo', name: 'Ala Vaikunthapurramuloo' } },
  { id: 'av6', name: 'Sittharala Sirapadu', duration: 200, coverImage: '/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: '/static/audio/sittharala_sirapadu.mp3', artist: { id: 'a10', name: 'Thaman S' }, album: { id: 'ala_vaikunthapurramuloo', name: 'Ala Vaikunthapurramuloo' } },
  // Geetha Govindam
  { id: 'gg1', name: 'Inkem Inkem Inkem Kaavaale', duration: 262, coverImage: '/static/images/geetha_govindham.jpg', audioUrl: '/static/audio/inkem_inkem.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'geetha_govindam', name: 'Geetha Govindam' } },
  { id: 'gg2', name: 'Yenti Yenti', duration: 200, coverImage: '/static/images/geetha_govindham.jpg', audioUrl: '/static/audio/yenti_yenti.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'geetha_govindam', name: 'Geetha Govindam' } },
  { id: 'gg3', name: 'Vachindamma', duration: 240, coverImage: '/static/images/geetha_govindham.jpg', audioUrl: '/static/audio/vachindamma.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'geetha_govindam', name: 'Geetha Govindam' } },
  { id: 'gg4', name: 'Kanureppala Kaalam', duration: 182, coverImage: '/static/images/geetha_govindham.jpg', audioUrl: '/static/audio/kanureppala_kaalam.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'geetha_govindam', name: 'Geetha Govindam' } },
  { id: 'gg5', name: 'Tanemandhe Tanemandhe', duration: 200, coverImage: '/static/images/geetha_govindham.jpg', audioUrl: '/static/audio/tanemandhe_tanemandhe.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'geetha_govindam', name: 'Geetha Govindam' } },
  { id: 'gg6', name: 'What The F', duration: 210, coverImage: '/static/images/geetha_govindham.jpg', audioUrl: '/static/audio/what_the_f.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'geetha_govindam', name: 'Geetha Govindam' } },
  { id: 'gg7', name: 'What The Life', duration: 210, coverImage: '/static/images/geetha_govindham.jpg', audioUrl: '/static/audio/what_the_life.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'geetha_govindam', name: 'Geetha Govindam' } },
  // Magadheera
  { id: 'mag1', name: 'Panchadara Bomma', duration: 280, coverImage: '/static/images/magadheera.jpg', audioUrl: '/static/audio/panchadara_bomma.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'magadheera', name: 'Magadheera' } },
  { id: 'mag2', name: 'Dheera Dheera', duration: 228, coverImage: '/static/images/magadheera.jpg', audioUrl: '/static/audio/dheera_dheera.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'magadheera', name: 'Magadheera' } },
  { id: 'mag3', name: 'Nee Kanti Chupullo', duration: 270, coverImage: '/static/images/magadheera.jpg', audioUrl: '/static/audio/nee_kanti_chupullo.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'magadheera', name: 'Magadheera' } },
  { id: 'mag4', name: 'Jorsey', duration: 290, coverImage: '/static/images/magadheera.jpg', audioUrl: '/static/audio/jorsey.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'magadheera', name: 'Magadheera' } },
  { id: 'mag5', name: 'Bangaru Kodipetta', duration: 344, coverImage: '/static/images/magadheera.jpg', audioUrl: '/static/audio/bangaru_kodipetta.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'magadheera', name: 'Magadheera' } },
  // Hi Nanna
  { id: 'hn1', name: 'Samayama', duration: 278, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/samayama.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: { id: 'hi_nanna', name: 'Hi Nanna' } },
  { id: 'hn2', name: 'Adigaa', duration: 217, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/adigaa.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: { id: 'hi_nanna', name: 'Hi Nanna' } },
  { id: 'hn3', name: 'Ammaadi', duration: 224, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/ammaadi.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: { id: 'hi_nanna', name: 'Hi Nanna' } },
  { id: 'hn4', name: 'Chedhu Nijam', duration: 263, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/chedhu_nijam.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: { id: 'hi_nanna', name: 'Hi Nanna' } },
  { id: 'hn5', name: 'Gaaju Bomma', duration: 273, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/gaaju_bomma.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: { id: 'hi_nanna', name: 'Hi Nanna' } },
  { id: 'hn6', name: 'Needhe Needhe', duration: 204, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/needhe_needhe.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: { id: 'hi_nanna', name: 'Hi Nanna' } },
  { id: 'hn7', name: 'Odiyamma', duration: 206, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/odiyamma.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: { id: 'hi_nanna', name: 'Hi Nanna' } },
  // Pushpa
  { id: 's3', name: 'Srivalli', duration: 224, coverImage: '/static/images/pushpa.jpg', audioUrl: '/static/audio/srivalli.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'pushpa', name: 'Pushpa: The Rise' } },
  { id: 'p_dakko', name: 'Dakko Dakko Meka', duration: 292, coverImage: '/static/images/pushpa.jpg', audioUrl: '/static/audio/dakko_dakko_meka.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'pushpa', name: 'Pushpa: The Rise' } },
  { id: 'p_saami', name: 'Saami Saami', duration: 223, coverImage: '/static/images/pushpa.jpg', audioUrl: '/static/audio/saami_saami.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'pushpa', name: 'Pushpa: The Rise' } },
  { id: 'p_oo_antava', name: 'Oo Antava Oo Oo Antava', duration: 228, coverImage: '/static/images/pushpa.jpg', audioUrl: '/static/audio/oo_antava.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'pushpa', name: 'Pushpa: The Rise' } },
  { id: 'p_eyy_bidda', name: 'Eyy Bidda Idhi Naa Adda', duration: 234, coverImage: '/static/images/pushpa.jpg', audioUrl: '/static/audio/eyy_bidda_idhi_naa_adda.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'pushpa', name: 'Pushpa: The Rise' } },
  // Shyam Singha Roy
  { id: 'ssr1', name: 'Pranavalaya', duration: 243, coverImage: '/static/images/shyam_singha_roy.jpg', audioUrl: '/static/audio/pranavalaya.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'ssr', name: 'Shyam Singha Roy' } },
  { id: 'ssr2', name: 'Sirivennela', duration: 255, coverImage: '/static/images/shyam_singha_roy.jpg', audioUrl: '/static/audio/sirivennela.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'ssr', name: 'Shyam Singha Roy' } },
  { id: 'ssr3', name: 'Sirivennela (Female)', duration: 182, coverImage: '/static/images/shyam_singha_roy.jpg', audioUrl: '/static/audio/sirivennela_female.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'ssr', name: 'Shyam Singha Roy' } },
  { id: 'ssr4', name: 'Edo Edo', duration: 202, coverImage: '/static/images/shyam_singha_roy.jpg', audioUrl: '/static/audio/edo_edo.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'ssr', name: 'Shyam Singha Roy' } },
  { id: 'ssr5', name: 'Tara', duration: 172, coverImage: '/static/images/shyam_singha_roy.jpg', audioUrl: '/static/audio/tara.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'ssr', name: 'Shyam Singha Roy' } },
  // Son of Satyamurthy
  { id: 'sos1', name: 'Chal Chalo Chalo', duration: 355, coverImage: '/static/images/son_of_satyamurthy.jpg', audioUrl: '/static/audio/chal_chalo_chalo.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'son_of_satyamurthy', name: 'Son of Satyamurthy' } },
  { id: 'sos2', name: 'Come To The Party', duration: 287, coverImage: '/static/images/son_of_satyamurthy.jpg', audioUrl: '/static/audio/come_to_the_party.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'son_of_satyamurthy', name: 'Son of Satyamurthy' } },
  { id: 'sos3', name: 'Jaaruko', duration: 308, coverImage: '/static/images/son_of_satyamurthy.jpg', audioUrl: '/static/audio/jaaruko.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'son_of_satyamurthy', name: 'Son of Satyamurthy' } },
  { id: 'sos4', name: 'Seethakaalam', duration: 309, coverImage: '/static/images/son_of_satyamurthy.jpg', audioUrl: '/static/audio/seethakaalam.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'son_of_satyamurthy', name: 'Son of Satyamurthy' } },
  { id: 'sos5', name: 'Super Machi', duration: 324, coverImage: '/static/images/son_of_satyamurthy.jpg', audioUrl: '/static/audio/super_machi.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'son_of_satyamurthy', name: 'Son of Satyamurthy' } },
  { id: 'sos6', name: 'Vacchadu', duration: 201, coverImage: '/static/images/son_of_satyamurthy.jpg', audioUrl: '/static/audio/vacchadu.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'son_of_satyamurthy', name: 'Son of Satyamurthy' } },
  // Mahanati
  { id: 'mah1', name: 'Mahanati', duration: 296, coverImage: '/static/images/mahanati.jpg', audioUrl: '/static/audio/mahanati.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'mahanati', name: 'Mahanati' } },
  { id: 'mah2', name: 'Mooga Manasulu', duration: 260, coverImage: '/static/images/mahanati.jpg', audioUrl: '/static/audio/mooga_manasulu.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'mahanati', name: 'Mahanati' } },
  { id: 'mah3', name: 'Sada Nannu', duration: 211, coverImage: '/static/images/mahanati.jpg', audioUrl: '/static/audio/sada_nannu.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'mahanati', name: 'Mahanati' } },
  { id: 'mah4', name: 'Aagipo Baalyama', duration: 261, coverImage: '/static/images/mahanati.jpg', audioUrl: '/static/audio/aagipo_baalyama.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'mahanati', name: 'Mahanati' } },
  { id: 'mah5', name: 'Gelupuleni Samaram', duration: 197, coverImage: '/static/images/mahanati.jpg', audioUrl: '/static/audio/gelupuleni_samaram.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'mahanati', name: 'Mahanati' } },
  { id: 'mah6', name: 'Chivaraku Migiledi', duration: 184, coverImage: '/static/images/mahanati.jpg', audioUrl: '/static/audio/chivaraku_migiledi.mp3', artist: { id: 'a4', name: 'Mickey J. Meyer' }, album: { id: 'mahanati', name: 'Mahanati' } },
  // Vunnadhi Okate Zindagi
  { id: 'voz1', name: 'Vunnadhi Okate Zindagi', duration: 298, coverImage: '/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: '/static/audio/vunnadhi_okate_zindagi.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'vunnadhi_okate_zindagi', name: 'Vunnadhi Okate Zindagi' } },
  { id: 'voz2', name: 'Trend Maarina Friend Maaradu', duration: 251, coverImage: '/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: '/static/audio/trend_marina_friend_maaradu.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'vunnadhi_okate_zindagi', name: 'Vunnadhi Okate Zindagi' } },
  { id: 'voz3', name: 'What Amma', duration: 303, coverImage: '/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: '/static/audio/what_amma.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'vunnadhi_okate_zindagi', name: 'Vunnadhi Okate Zindagi' } },
  { id: 'voz4', name: 'Rayyi Rayyi Mantu', duration: 325, coverImage: '/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: '/static/audio/rayyi_rayyi_mantu.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'vunnadhi_okate_zindagi', name: 'Vunnadhi Okate Zindagi' } },
  { id: 'voz5', name: 'Life Is A Rainbow', duration: 345, coverImage: '/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: '/static/audio/life_is_a_rainbow.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'vunnadhi_okate_zindagi', name: 'Vunnadhi Okate Zindagi' } },
  // Majili
  { id: 'maj1', name: 'Priyathama Priyathama', duration: 243, coverImage: '/static/images/majili.jpg', audioUrl: '/static/audio/priyathama_priyathama.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'majili', name: 'Majili' } },
  { id: 'maj2', name: 'Ye Manishike Majiliyo', duration: 260, coverImage: '/static/images/majili.jpg', audioUrl: '/static/audio/ye_manishike_majiliyo.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'majili', name: 'Majili' } },
  { id: 'maj3', name: 'Yedetthu Mallele', duration: 200, coverImage: '/static/images/majili.jpg', audioUrl: '/static/audio/yedetthu_mallele.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'majili', name: 'Majili' } },
  { id: 'maj4', name: 'Naa Gundello', duration: 287, coverImage: '/static/images/majili.jpg', audioUrl: '/static/audio/naa_gundello.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'majili', name: 'Majili' } },
  { id: 'maj5', name: 'One & Two & Three', duration: 226, coverImage: '/static/images/majili.jpg', audioUrl: '/static/audio/one_two_three.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'majili', name: 'Majili' } },
  { id: 'maj6', name: 'Maayya Maayya', duration: 267, coverImage: '/static/images/majili.jpg', audioUrl: '/static/audio/maayya_maayya.mp3', artist: { id: 'a8', name: 'Gopi Sundar' }, album: { id: 'majili', name: 'Majili' } },
  // Arjun
  { id: 'arj1', name: 'Madhura Madhure Meenakshi', duration: 320, coverImage: '/static/images/arjun.jpg', audioUrl: '/static/audio/madhura_madhuratara.mp3', artist: { id: 'a14', name: 'Mani Sharma' }, album: { id: 'arjun', name: 'Arjun' } },
  { id: 'arj2', name: 'Aey Pilla', duration: 250, coverImage: '/static/images/arjun.jpg', audioUrl: '/static/audio/aey_pilla.mp3', artist: { id: 'a14', name: 'Mani Sharma' }, album: { id: 'arjun', name: 'Arjun' } },
  { id: 'arj3', name: 'Dum Dumare', duration: 280, coverImage: '/static/images/arjun.jpg', audioUrl: '/static/audio/dum_dumare.mp3', artist: { id: 'a14', name: 'Mani Sharma' }, album: { id: 'arjun', name: 'Arjun' } },
  { id: 'arj4', name: 'O Cheli Nee Oyyarale', duration: 300, coverImage: '/static/images/arjun.jpg', audioUrl: '/static/audio/o_cheli.mp3', artist: { id: 'a14', name: 'Mani Sharma' }, album: { id: 'arjun', name: 'Arjun' } },
  { id: 'arj5', name: 'Okka Maata', duration: 260, coverImage: '/static/images/arjun.jpg', audioUrl: '/static/audio/okka_mata.mp3', artist: { id: 'a14', name: 'Mani Sharma' }, album: { id: 'arjun', name: 'Arjun' } },
  { id: 'arj6', name: 'Ra Ra Rajakumara', duration: 260, coverImage: '/static/images/arjun.jpg', audioUrl: '/static/audio/raa_raa.mp3', artist: { id: 'a14', name: 'Mani Sharma' }, album: { id: 'arjun', name: 'Arjun' } },
  // Baahubali
  { id: 'bah1', name: 'Dhivara', duration: 343, coverImage: '/static/images/bahubali.jpg', audioUrl: '/static/audio/dhivara.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'bahubali', name: 'Baahubali: The Beginning' } },
  { id: 'bah2', name: 'Mamatala Talli', duration: 204, coverImage: '/static/images/bahubali.jpg', audioUrl: '/static/audio/mamathala_thalli.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'bahubali', name: 'Baahubali: The Beginning' } },
  { id: 'bah3', name: 'Manohari', duration: 232, coverImage: '/static/images/bahubali.jpg', audioUrl: '/static/audio/manohari.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'bahubali', name: 'Baahubali: The Beginning' } },
  { id: 'bah4', name: 'Sivuni Aana', duration: 325, coverImage: '/static/images/bahubali.jpg', audioUrl: '/static/audio/sivuni_aana.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'bahubali', name: 'Baahubali: The Beginning' } },
  { id: 'bah5', name: 'Pacha Bottasi', duration: 273, coverImage: '/static/images/bahubali.jpg', audioUrl: '/static/audio/pachha_bottasi.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'bahubali', name: 'Baahubali: The Beginning' } },
  // Mirchi
  { id: 'mir2', name: 'Barbie Girl', duration: 240, coverImage: '/static/images/mirchi.jpg', audioUrl: '/static/audio/barbie_girl.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'mirchi', name: 'Mirchi' } },
  { id: 'mir3', name: 'Darlingey', duration: 230, coverImage: '/static/images/mirchi.jpg', audioUrl: '/static/audio/darlingey.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'mirchi', name: 'Mirchi' } },
  { id: 'mir4', name: 'Idhedho Bagundhe', duration: 270, coverImage: '/static/images/mirchi.jpg', audioUrl: '/static/audio/idhedho_bagundhe.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'mirchi', name: 'Mirchi' } },
  { id: 'mir5', name: 'Nee Choopula', duration: 250, coverImage: '/static/images/mirchi.jpg', audioUrl: '/static/audio/nee_choopula.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'mirchi', name: 'Mirchi' } },
  { id: 'mir6', name: 'Pandagala Digivachavu', duration: 290, coverImage: '/static/images/mirchi.jpg', audioUrl: '/static/audio/pandagala_digivachavu.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'mirchi', name: 'Mirchi' } },
  { id: 'mir7', name: 'Yahoon Yahoon', duration: 280, coverImage: '/static/images/mirchi.jpg', audioUrl: '/static/audio/yahoon_yahoon.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: { id: 'mirchi', name: 'Mirchi' } },
  // Orange
  { id: 'ora1', name: 'Ola Olaala', duration: 260, coverImage: '/static/images/orange.jpg', audioUrl: '/static/audio/ola_olaala.mp3', artist: { id: 'a11', name: 'Harris Jayaraj' }, album: { id: 'orange', name: 'Orange' } },
  { id: 'ora2', name: 'Chilipiga', duration: 250, coverImage: '/static/images/orange.jpg', audioUrl: '/static/audio/chilipiga.mp3', artist: { id: 'a11', name: 'Harris Jayaraj' }, album: { id: 'orange', name: 'Orange' } },
  { id: 'ora3', name: 'Nenu Nuvvantu', duration: 280, coverImage: '/static/images/orange.jpg', audioUrl: '/static/audio/nenu_nuvvantu.mp3', artist: { id: 'a11', name: 'Harris Jayaraj' }, album: { id: 'orange', name: 'Orange' } },
  { id: 'ora4', name: 'Hello Rammante', duration: 282, coverImage: '/static/images/orange.jpg', audioUrl: '/static/audio/hello_rammante.mp3', artist: { id: 'a11', name: 'Harris Jayaraj' }, album: { id: 'orange', name: 'Orange' } },
  { id: 'ora5', name: 'O Range', duration: 272, coverImage: '/static/images/orange.jpg', audioUrl: '/static/audio/o_range.mp3', artist: { id: 'a11', name: 'Harris Jayaraj' }, album: { id: 'orange', name: 'Orange' } },
  { id: 'ora6', name: 'Rooba Rooba', duration: 270, coverImage: '/static/images/orange.jpg', audioUrl: '/static/audio/rooba_rooba.mp3', artist: { id: 'a11', name: 'Harris Jayaraj' }, album: { id: 'orange', name: 'Orange' } },
  // Darling
  { id: 'dar1', name: 'Inka Edo', duration: 309, coverImage: '/static/images/darling.jpg', audioUrl: '/static/audio/inka_edo.mp3', artist: { id: 'a13', name: 'G. V. Prakash Kumar' }, album: { id: 'darling', name: 'Darling' } },
  { id: 'dar2', name: 'Neeve', duration: 280, coverImage: '/static/images/darling.jpg', audioUrl: '/static/audio/neeve.mp3', artist: { id: 'a13', name: 'G. V. Prakash Kumar' }, album: { id: 'darling', name: 'Darling' } },
  { id: 'dar3', name: 'Hosahore', duration: 226, coverImage: '/static/images/darling.jpg', audioUrl: '/static/audio/hosahore.mp3', artist: { id: 'a13', name: 'G. V. Prakash Kumar' }, album: { id: 'darling', name: 'Darling' } },
  { id: 'dar4', name: 'Priyathama', duration: 260, coverImage: '/static/images/darling.jpg', audioUrl: '/static/audio/priyathama.mp3', artist: { id: 'a13', name: 'G. V. Prakash Kumar' }, album: { id: 'darling', name: 'Darling' } },
  { id: 'dar5', name: 'One Boy One Girl', duration: 244, coverImage: '/static/images/darling.jpg', audioUrl: '/static/audio/one_boy_one_girl.mp3', artist: { id: 'a13', name: 'G. V. Prakash Kumar' }, album: { id: 'darling', name: 'Darling' } },
  { id: 'dar6', name: 'Bulle', duration: 267, coverImage: '/static/images/darling.jpg', audioUrl: '/static/audio/bulle.mp3', artist: { id: 'a13', name: 'G. V. Prakash Kumar' }, album: { id: 'darling', name: 'Darling' } },
  // V
  { id: 'v1', name: 'Manasu Maree', duration: 248, coverImage: '/static/images/v.jpg', audioUrl: '/static/audio/manasu_maree.mp3', artist: { id: 'a12', name: 'Amit Trivedi' }, album: { id: 'v', name: 'V' } },
  { id: 'v2', name: 'Vastunna Vachestunna', duration: 202, coverImage: '/static/images/v.jpg', audioUrl: '/static/audio/vastunna_vachestunna.mp3', artist: { id: 'a12', name: 'Amit Trivedi' }, album: { id: 'v', name: 'V' } },
  { id: 'v3', name: 'Baby Touch Me Now', duration: 186, coverImage: '/static/images/v.jpg', audioUrl: '/static/audio/baby_touch_me_now.mp3', artist: { id: 'a12', name: 'Amit Trivedi' }, album: { id: 'v', name: 'V' } },
  { id: 'v4', name: 'Ranga Rangeli', duration: 228, coverImage: '/static/images/v.jpg', audioUrl: '/static/audio/ranga_rangeli.mp3', artist: { id: 'a12', name: 'Amit Trivedi' }, album: { id: 'v', name: 'V' } },
  // Peddi
  { id: 'ped1', name: 'Chikiri Chikiri', duration: 248, coverImage: '/static/images/peddi.jpg', audioUrl: '/static/audio/chikiri_chikiri.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'peddi', name: 'Peddi' } },
  { id: 'ped2', name: 'Hellallallo', duration: 219, coverImage: '/static/images/peddi.jpg', audioUrl: '/static/audio/hellallallo.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'peddi', name: 'Peddi' } },
  { id: 'ped3', name: 'Massa Massa', duration: 203, coverImage: '/static/images/peddi.jpg', audioUrl: '/static/audio/massa_massa.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'peddi', name: 'Peddi' } },
  { id: 'ped4', name: 'Rai Rai Raa Raa', duration: 254, coverImage: '/static/images/peddi.jpg', audioUrl: '/static/audio/rai_rai_raa_raa.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: { id: 'peddi', name: 'Peddi' } },
];

// ─── Hindi songs (Bollywood hits from local Songs folder) ──────────────────
const HINDI_SONGS = [
  { id: 'hin1', name: 'Kesariya', duration: 256, coverImage: '/static/images/kesariya.jpg', audioUrl: '/static/audio/kesariya.mp3', artist: { id: 'h1', name: 'Arijit Singh' }, album: { id: 'brahmaastra', name: 'Brahmastra' } },
  { id: 'hin2', name: 'Bekhayali', duration: 336, coverImage: '/static/images/kabir_singh.jpg', audioUrl: '/static/audio/bekhayali.mp3', artist: { id: 'h1', name: 'Arijit Singh' }, album: { id: 'kabir_singh', name: 'Kabir Singh' } },
  { id: 'hin3', name: 'Kaise Hua', duration: 230, coverImage: '/static/images/kabir_singh.jpg', audioUrl: '/static/audio/kaise_hua.mp3', artist: { id: 'h1', name: 'Vishal Mishra' }, album: { id: 'kabir_singh', name: 'Kabir Singh' } },
  { id: 'hin4', name: 'Tujhe Kitna Chahne Lage', duration: 298, coverImage: '/static/images/kabir_singh.jpg', audioUrl: '/static/audio/tujhe_kitna.mp3', artist: { id: 'h1', name: 'Arijit Singh' }, album: { id: 'kabir_singh', name: 'Kabir Singh' } },
  { id: 'hin5', name: 'Tum Hi Ho', duration: 268, coverImage: '/static/images/aashiqui2.jpg', audioUrl: '/static/audio/tum_hi_ho.mp3', artist: { id: 'h1', name: 'Arijit Singh' }, album: { id: 'aashiqui2', name: 'Aashiqui 2' } },
  { id: 'hin6', name: 'Apna Bana Le', duration: 266, coverImage: '/static/images/bhediya.jpg', audioUrl: '/static/audio/apna_bana_le.mp3', artist: { id: 'h1', name: 'Arijit Singh' }, album: { id: 'bhediya', name: 'Bhediya' } },
  { id: 'hin7', name: 'Gehra Hua', duration: 310, coverImage: '/static/images/popular_hits.jpg', audioUrl: '/static/audio/gehra_hua.mp3', artist: { id: 'h2', name: 'Various Artists' }, album: { id: 'hindi_hits', name: 'Hindi Hits' } },
  { id: 'hin8', name: 'Nadaaniyan', duration: 215, coverImage: '/static/images/popular_hits.jpg', audioUrl: '/static/audio/nadaaniyan.mp3', artist: { id: 'h3', name: 'Akshath' }, album: { id: 'hindi_hits', name: 'Hindi Hits' } },
  { id: 'hin9', name: 'Sahiba', duration: 290, coverImage: '/static/images/popular_hits.jpg', audioUrl: '/static/audio/sahiba.mp3', artist: { id: 'h2', name: 'Various Artists' }, album: { id: 'hindi_hits', name: 'Hindi Hits' } },
  { id: 'hin10', name: 'Paaro', duration: 232, coverImage: '/static/images/popular_hits.jpg', audioUrl: '/static/audio/paaro.mp3', artist: { id: 'h2', name: 'Various Artists' }, album: { id: 'hindi_hits', name: 'Hindi Hits' } },
];

// ─── English songs (SoundHelix open-source + English versions) ─────────────
const ENGLISH_SONGS = [
  { id: 'os1', name: 'Electronic Summer', duration: 180, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os2', name: 'Chill Synthwave', duration: 210, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os3', name: 'Deep Bass Drop', duration: 240, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os4', name: 'Ambient Relax', duration: 195, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os5', name: 'Upbeat Tech', duration: 265, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os6', name: 'Midnight Outrun', duration: 198, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os7', name: 'Lofi Sleep Cafe', duration: 215, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os8', name: 'Golden Hour Acoustic', duration: 172, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os9', name: 'Virtual Neon Pulse', duration: 242, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os10', name: 'Dream State Horizon', duration: 189, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os11', name: 'Club Dance Arena', duration: 254, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'os12', name: 'Late Night Jazz Session', duration: 219, coverImage: '/static/images/popular_hits.jpg', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', artist: { id: 'a99', name: 'SoundHelix' }, album: { id: 'popular_hits', name: 'Popular Hits' } },
  { id: 'bah8', name: 'Dheevara (English Version)', duration: 206, coverImage: '/static/images/bahubali.jpg', audioUrl: '/static/audio/dhivara_english.mp3', artist: { id: 'a7', name: 'M. M. Keeravani' }, album: { id: 'bahubali', name: 'Baahubali' } },
];

// ─── The 4 pre-built playlists ──────────────────────────────────────────────
export const MOCK_PLAYLISTS = [
  {
    id: 'pl_local',
    name: 'Local — All Songs',
    description: 'Your complete local music collection in one place.',
    coverImage: '/static/images/popular_hits.jpg',
    songCount: TELUGU_SONGS.length + HINDI_SONGS.length + ENGLISH_SONGS.length,
    songs: [...TELUGU_SONGS, ...HINDI_SONGS, ...ENGLISH_SONGS],
    previewSongs: [...TELUGU_SONGS, ...HINDI_SONGS, ...ENGLISH_SONGS].slice(0, 4),
  },
  {
    id: 'pl_telugu',
    name: 'Telugu Hits',
    description: 'Best of Telugu cinema — classic & modern blockbusters.',
    coverImage: '/static/images/rangasthalam.jpg',
    songCount: TELUGU_SONGS.length,
    songs: TELUGU_SONGS,
    previewSongs: TELUGU_SONGS.slice(0, 4),
  },
  {
    id: 'pl_hindi',
    name: 'Hindi Hits',
    description: 'Top Bollywood bangers and romantic classics.',
    coverImage: '/static/images/kabir_singh.jpg',
    songCount: HINDI_SONGS.length,
    songs: HINDI_SONGS,
    previewSongs: HINDI_SONGS.slice(0, 4),
  },
  {
    id: 'pl_english',
    name: 'English Mix',
    description: 'International tracks — electronic, lofi, jazz & more.',
    coverImage: '/static/images/popular_hits.jpg',
    songCount: ENGLISH_SONGS.length,
    songs: ENGLISH_SONGS,
    previewSongs: ENGLISH_SONGS.slice(0, 4),
  },
];
