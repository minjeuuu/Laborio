export type WorldId =
  | 'world1'
  | 'world2'
  | 'world3'
  | 'world4'
  | 'world5'
  | 'world6'
  | 'holidays'
  | 'warp_calc'
  | 'flashcards'
  | 'wage_matrix'
  | 'shop'
  | 'vault';

export type MarioTheme =
  | 'overworld'
  | 'underground'
  | 'castle'
  | 'galaxy'
  | 'rainbow'
  | 'bowser_lava'
  | 'retro_nes'
  | 'neon_synth'
  | 'desert_oasis'
  | 'aurora'
  | 'pro_study_paper'
  | 'pro_study_slate'
  | 'pro_study_sage'
  | 'peach_castle'
  | 'yoshi_island'
  | 'rosalina_comet'
  | 'royal_parchment'
  | 'luigi_mansion'
  | 'sakura_garden'
  | 'arctic_ice_world'
  | 'espresso_tribunal'
  | 'wario_gold_vault'
  | 'waluigi_twilight'
  | 'daisy_sunshine'
  | 'koopa_library'
  | 'donkey_jungle'
  | 'dole_executive'
  | 'cyberpunk_matrix'
  | 'starlight_observatory'
  | 'toad_candy_bazaar'
  | 'vanilla_dome'
  | 'chocolate_island'
  | 'donut_plains'
  | 'star_road_nebula'
  | 'nlrc_tribunal'
  | 'pro_study_nordic'
  | 'pro_study_sepia';

export type AppStudyFontId =
  | 'jakarta'
  | 'editorial_serif'
  | 'lexend'
  | 'outfit'
  | 'crimson'
  | 'dm_sans'
  | 'bricolage'
  | 'jetbrains_mono'
  | 'jakarta_sans'
  | 'inter'
  | 'inter_clean'
  | 'outfit_geometric'
  | 'dm_sans_clean'
  | 'manrope'
  | 'trebuchet_syllabus'
  | 'public_sans'
  | 'humanist_sans'
  | 'noto_sans'
  | 'noto_sans_universal'
  | 'urbanist'
  | 'urbanist_clean'
  | 'quicksand'
  | 'quicksand_friendly'
  | 'fredoka'
  | 'fredoka_bubble'
  | 'josefin_sans'
  | 'josefin_vintage'
  | 'space_grotesk'
  | 'space_grotesk_modern'
  | 'bricolage_editorial'
  | 'archivo'
  | 'archivo_grotesque'
  | 'merriweather'
  | 'merriweather_digest'
  | 'classic_serif'
  | 'source_serif_4'
  | 'editorial_garamond'
  | 'cormorant_garamond'
  | 'eb_garamond'
  | 'eb_garamond_codex'
  | 'palatino_chancery'
  | 'crimson_pro'
  | 'crimson_juris'
  | 'baskerville_law'
  | 'libre_baskerville'
  | 'cambria_statute'
  | 'lora'
  | 'playfair_diploma'
  | 'playfair_display'
  | 'fraunces'
  | 'fraunces_editorial'
  | 'spectral'
  | 'spectral_scra'
  | 'pt_serif'
  | 'pt_serif_gazette'
  | 'cinzel'
  | 'cinzel_supreme'
  | 'georgia_bench'
  | 'tabular_mono'
  | 'ibm_plex_mono'
  | 'fira_code'
  | 'fira_code_audit'
  | 'inconsolata'
  | 'inconsolata_codal'
  | 'space_mono'
  | 'space_mono_ledger'
  | 'press_start_2p'
  | 'press_start_mario'
  | 'silkscreen'
  | 'silkscreen_nes'
  | 'pixelify_sans'
  | 'pixelify_retro'
  | 'vt323'
  | 'vt323_docket_terminal'
  | 'dotgothic16'
  | 'dotgothic_arcade'
  | 'caveat'
  | 'caveat_handwritten'
  | 'orbitron'
  | 'orbitron_starroad'
  | 'oswald'
  | 'oswald_condensed'
  | 'plus_jakarta_sans'
  | 'lexend_dyslexia_friendly'
  | 'times_new_roman_trad'
  | 'courier_docket'
  | 'jetbrains_tabular'
  | 'playfair_royal'
  | 'cormorant';

export type MarioAvatar =
  | 'mario'
  | 'luigi'
  | 'peach'
  | 'daisy'
  | 'rosalina'
  | 'pauline'
  | 'toad'
  | 'toadette'
  | 'capttoad'
  | 'yoshi'
  | 'birdo'
  | 'donkeykong'
  | 'diddykong'
  | 'wario'
  | 'waluigi'
  | 'bowser'
  | 'bowserjr'
  | 'koopatroopa'
  | 'shyguy'
  | 'boo'
  | 'kamek'
  | 'drybones'
  | 'metalmario'
  | 'goldmario'
  | 'firemario'
  | 'iceluigi'
  | 'tanookimario'
  | 'catpeach'
  | 'cosmicrosalina'
  | 'drybowser'
  | 'goldenyoshi'
  | 'lawyertoad'
  | 'shadowmario'
  | 'drpeach'
  | 'egadd'
  | 'paulinemetro'
  | 'diddyscholar'
  | 'daisychamp'
  | 'bowserjrmecha'
  | 'toadettescholar'
  | 'kingboo'
  | 'peteypiranha'
  | 'wiggler'
  | 'lakitu'
  | 'hammerbro'
  | 'crankykong'
  | 'funkykong'
  | 'nabbit'
  | 'fluddmario'
  | 'chargetoad'
  | 'blooper'
  | 'montymole'
  | 'spike'
  | 'ninji'
  | 'magikoopa'
  | 'drybonesgold'
  | 'poochy'
  | 'chainchomp'
  | 'bobomb'
  | 'chefkinopio'
  | 'dixiekong'
  | 'tinykong'
  | 'chunkykong'
  | 'luma'
  | 'lubba'
  | 'cappy'
  | 'tiara'
  | 'flyguy'
  | 'goomba'
  | 'paragoomba'
  | 'paratroopa'
  | 'buzzybeetle'
  | 'spiny'
  | 'cheepcheep'
  | 'pokey'
  | 'thwomp'
  | 'whomp'
  | 'kingbobomb'
  | 'wart'
  | 'tatanga'
  | 'mouser'
  | 'boomboom'
  | 'pompom'
  | 'rex'
  | 'charginchuck'
  | 'koopakid'
  | 'kamekclone'
  | 'drybowserblue'
  | 'foremanspike'
  | 'toadsworth'
  | 'professorfrankly'
  | 'rawkhawk'
  | 'vivian'
  | 'goombella'
  | 'kooper'
  | 'ladybow'
  | 'dimentio'
  | 'countbleck'
  | 'geno'
  | 'mallow'
  | 'fawful'
  | 'midbus'
  | 'cackletta'
  | 'starlow'
  | 'peachette';

export type ComplexityMode = 'beginner' | 'advanced';

export type StudyDifficulty = 'casual' | 'exam_prep';

export type ShopCategory =
  | 'powerup'
  | 'special_event'
  | 'luxury'
  | 'theme'
  | 'avatar'
  | 'companion'
  | 'frame'
  | 'ring'
  | 'perk'
  | 'soundpack'
  | 'title'
  | 'certificate';

export type MarioEquippedRing =
  | 'ring_none'
  | 'ring_curatorial_gold'
  | 'ring_one_up'
  | 'ring_star_immunity'
  | 'ring_speed_boot'
  | 'ring_scholar_ruby'
  | 'ring_mega_mushroom'
  | 'ring_boomerang_flower'
  | 'ring_super_acorn'
  | 'ring_cloud_flower';

export type SoundPackId =
  | 'sound_default'
  | 'sound_nes_8bit'
  | 'sound_snes_16bit'
  | 'sound_zen_lofi'
  | 'sound_galaxy_synth'
  | 'sound_bowser_metal'
  | 'sound_orchestral'
  | 'sound_underwater_ambient'
  | 'sound_peach_royal'
  | 'sound_yoshi_tropical'
  | 'sound_ghost_organ'
  | 'sound_dk_jungle'
  | 'sound_rainbow_synthwave'
  | 'sound_paper_acoustic'
  | 'sound_starlight_jazz'
  | 'sound_wario_gold'
  | 'sound_luigi_haunted'
  | 'sound_koopa_beach'
  | 'sound_kart_turbo'
  | 'sound_super_star';

export type StudyCompanionId =
  | 'comp_none'
  | 'comp_luma'
  | 'comp_baby_yoshi'
  | 'comp_polterpup'
  | 'comp_counsel_toad'
  | 'comp_chain_chomp'
  | 'comp_lakitu'
  | 'comp_toadsworth'
  | 'comp_captain_toad'
  | 'comp_pauline'
  | 'comp_dry_bones'
  | 'comp_shy_guy'
  | 'comp_birdo'
  | 'comp_dk'
  | 'comp_diddy'
  | 'comp_kamek'
  | 'comp_nabbit'
  | 'comp_rosalina_star'
  | 'comp_bowser_jr_clerk'
  | 'comp_wario_tax_auditor'
  | 'comp_daisy_athletic_coach'
  | 'comp_luma_sage'
  | 'gear_comp_cappy_counsel'
  | 'comp_shy_guy_clerk';

export type CardFrameId =
  | 'frame_default'
  | 'frame_royal_gold'
  | 'frame_starlight_prism'
  | 'frame_retro_brick'
  | 'frame_emerald_pipe'
  | 'frame_supreme_crimson'
  | 'frame_koopa_sovereign'
  | 'frame_peach_stained_glass'
  | 'frame_bowser_obsidian'
  | 'frame_yoshi_botanical'
  | 'frame_boo_ethereal'
  | 'frame_rainbow_prism'
  | 'frame_juris_doctor'
  | 'frame_supernova_mastery'
  | 'frame_glacier_crystal'
  | 'frame_midnight_executive'
  | 'frame_aurora_borealis';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  description: string;
  previewColor?: string;
  avatarId?: MarioAvatar;
  themeId?: MarioTheme;
  soundPackId?: SoundPackId;
  companionId?: StudyCompanionId;
  frameId?: CardFrameId;
  ringId?: MarioEquippedRing;
  luxuryFrameId?: string;
  luxuryAuraId?: string;
  luxuryCartridgeId?: string;
  specialEventType?: 'double_xp_1h' | 'unlock_modules_30m' | 'boss_skip_token' | 'invincible_frenzy';
  faction?: string;
  badge?: string;
  perkEffect?: string;
  isConsumable?: boolean;
  durationMinutes?: number;
}

export type TopicDifficulty = 'Foundation' | 'Intermediate' | 'Bar Master';

export interface LawTopic {
  id: string;
  worldId: WorldId;
  title: string;
  badge: string; // e.g., "Art. 82", "R.A. 11360", "D.O. 174"
  iconName: string; // Mario item representation
  summary: string;
  difficulty?: TopicDifficulty;
  verbatimProvision?: string; // Exact statutory text of the provision
  beginnerSummary?: string; // Plain-English simplified summary for Beginner mode
  practicalTakeaway?: string; // Real-world practical application for employees/employers
  keyDoctrines: string[];
  rules: {
    heading: string;
    description?: string;
    items?: string[];
    subSections?: {
      title: string;
      items: string[];
    }[];
    tableData?: {
      headers: string[];
      rows: string[][];
    };
  }[];
  exceptions?: {
    generalRule: string;
    exceptions: string[];
    exceptionToException?: string[];
  }[];
  barTips?: string[];
  keyTips?: string[];
}

export interface Flashcard {
  id: string;
  world: string;
  worldNum: number;
  question: string;
  answer: string;
  keyTakeaway: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface RegionalWageEntry {
  region: string;
  effectivity: string;
  nonAgri: string;
  agri: string;
}

export interface KasambahayWageEntry {
  region: string;
  effectivity: string;
  minimumWage: string;
}
