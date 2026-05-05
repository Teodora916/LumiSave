# Pravila Izračunavanja - LumiSave Kalkulatori

Ovaj dokument sadrži detaljna pravila, formule i parametre koji se koriste u pozadinskom sistemu LumiSave platforme za izračunavanje ušteda i rezultata.

---

## 💡 LED Kalkulator

LED Kalkulator izračunava potencijalne uštede prelaskom sa tradicionalnog osvetljenja na LED tehnologiju.

### 1. Ekvivalentna Snaga (Wattage Mappings)
Ako sistem ne može pronaći tačan ekvivalent, koristi se procena: **LED troši ~15% snage obične sijalice.**

| Tip sijalice | Stara snaga (W) | LED ekvivalent (W) |
| :--- | :--- | :--- |
| **Incandescent** (Obična) | 25, 40, 60, 75, 100, 150 | 3, 5, 8, 11, 14, 20 |
| **CFL** (Štedljiva) | 9, 11, 13, 15, 18, 23 | 6, 7, 8, 9, 11, 14 |
| **Halogen** | 20, 35, 50, 75, 100 | 3, 5, 7, 10, 14 |
| **T8 Fluorescent** | 18, 36, 58 | 9, 18, 28 |
| **MR16** | 20, 35, 50 | 3, 5, 7 |
| **PAR** | 50, 75, 100 | 8, 12, 15 |

### 2. Cene Investicije
Ukoliko korisnik ne unese cenu, koriste se sledeće podrazumevane cene po sijalici:
- **Incandescent**: 690 RSD
- **CFL**: 790 RSD
- **Halogen**: 590 RSD
- **T8 Fluorescent**: 1290 RSD
- **MR16**: 590 RSD
- **PAR**: 890 RSD
- *Ostalo*: 790 RSD

### 3. Obračun Računa za Struju
Sistem simulira zvanični obračun EPS-a (Srbija).

**Fiksni troškovi:**
- `(Odobrena snaga (kW) * 60.8947) + 160.67 RSD` (Trošak pristupa i merno mesto).

**Zone potrošnje (mesečno):**
- **Zelena zona**: do 350 kWh
- **Plava zona**: 351 – 1200 kWh
- **Crvena zona**: preko 1200 kWh

**Cene po zonama (RSD/kWh):**
| Zona | Dvotarifno (Viša / Niža) | Jednotarifno |
| :--- | :--- | :--- |
| **Zelena** | 9.6136 / 2.4034 | 8.4119 |
| **Plava** | 14.4203 / 3.6051 | 12.6178 |
| **Crvena** | 28.8407 / 7.2102 | 25.2356 |

### 4. Ostale Formule
- **Godišnja potrošnja (kWh)**: `(Snaga (W) * Broj sijalica * Sati rada dnevno * 365) / 1000`
- **Godišnja ušteda (RSD)**: `(Godišnji račun BEZ LED - Godišnji račun SA LED)`
- **Period povrata (meseci)**: `Investicija / (Godišnja ušteda / 12)`
- **Smanjenje CO2**: `Ušteđeni kWh * 0.417 kg`

---

## 🏠 Smart Home Score

Smart Home Score ocenjuje energetsku efikasnost i automatizaciju doma na skali od 0 do 100.

### 1. Bodovanje (Max 100 poena)
| Komponenta | Maksimalni bodovi | Pravilo |
| :--- | :--- | :--- |
| **LED Osvetljenje** | 20 poena | Dobija se ako korisnik već koristi LED. |
| **Smart Plugs** | 20 poena | `(Broj pokrivenih uređaja / Ukupno uređaja) * 20` |
| **Termostat** | 25 poena | Mehanički (+5), Digitalni (+15), Smart (+25). |
| **Automatizacija** | 20 poena | `Broj tipova automatizacije * 4` (max 20). |
| **Bonus/Ostalo** | 15 poena | Dodatni faktori efikasnosti. |

### 2. Ocene (Grades)
- **A** (>= 90): Izuzetna efikasnost.
- **B** (75 - 89): Visoka efikasnost.
- **C** (60 - 74): Solidna osnova, ima prostora za napredak.
- **D** (40 - 59): Nizak nivo automatizacije.
- **F** (< 40): Veliki potencijal za uštedu (visok gubitak energije).

### 3. Potrošnja uređaja u stanju mirovanja (Vampire Power)
Sistem koristi prosečne vrednosti potrošnje (Standby Watts):
- **TV**: 1.5W
- **Desktop Računar**: 10W
- **Monitor**: 2W
- **Ruter (WiFi)**: 7.5W
- **Klima uređaj**: 12W
- **Punjač za mobilni**: 0.3W
- **Mikrotalasna**: 3.5W

### 4. Faktori uštede automatizacije
Procenat smanjenja potrošnje osvetljenja po tipu automatizacije:
- **Senzor pokreta**: ~30%
- **Vremenski raspored**: ~15%
- **Daylight Harvesting**: ~22.5%
- **Geofencing**: ~17.5%
- **Scene Control**: ~10%
- *Napomena: Ukupna ušteda automatizacije je ograničena na maksimalno 60%.*

### 5. Uštede Termostata
Procenat uštede na grejanju zavisi od trenutnog termostata i energenta (primeri):
- **Mehanički -> Smart (Struja)**: ~25% uštede.
- **Digitalni -> Smart (Gas)**: ~17% uštede.
- **Mehanički -> Smart (Toplana)**: ~15% uštede.
