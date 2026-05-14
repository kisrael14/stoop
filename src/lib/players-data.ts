// INTERNAL ONLY — do NOT import this file in UI components.
// Used exclusively by detection utilities to auto-tag team/league context.

interface Player {
  name: string;
  aliases: string[];
  teamId: string;
}

const PLAYERS: Player[] = [
  // ── NFL: Chiefs ────────────────────────────────────────────────────────────
  { name: 'Patrick Mahomes', aliases: ['Mahomes', 'Patty Mahomes', 'Pat Mahomes'], teamId: 'chiefs' },
  { name: 'Travis Kelce', aliases: ['Kelce', 'T. Kelce'], teamId: 'chiefs' },
  { name: 'Chris Jones', aliases: ['Chris Jones'], teamId: 'chiefs' },
  { name: 'Rashee Rice', aliases: ['Rashee Rice', 'Rice'], teamId: 'chiefs' },
  { name: 'Xavier Worthy', aliases: ['Worthy', 'Xavier Worthy'], teamId: 'chiefs' },
  { name: 'Isiah Pacheco', aliases: ['Pacheco', 'Isiah Pacheco'], teamId: 'chiefs' },
  { name: 'Harrison Butker', aliases: ['Butker', 'Harrison Butker'], teamId: 'chiefs' },
  { name: 'Nick Bolton', aliases: ['Bolton', 'Nick Bolton'], teamId: 'chiefs' },
  { name: 'Trent McDuffie', aliases: ['McDuffie', 'Trent McDuffie'], teamId: 'chiefs' },
  { name: 'L\'Jarius Sneed', aliases: ['Sneed'], teamId: 'chiefs' },

  // ── NFL: Eagles ────────────────────────────────────────────────────────────
  { name: 'Jalen Hurts', aliases: ['Hurts', 'Jalen Hurts'], teamId: 'eagles' },
  { name: 'A.J. Brown', aliases: ['AJ Brown', 'A.J. Brown', 'Eleven'], teamId: 'eagles' },
  { name: 'DeVonta Smith', aliases: ['DeVonta Smith', 'DeVonta', 'Smitty'], teamId: 'eagles' },
  { name: 'Saquon Barkley', aliases: ['Saquon', 'Barkley', 'Saquon Barkley'], teamId: 'eagles' },
  { name: 'Jordan Mailata', aliases: ['Mailata'], teamId: 'eagles' },
  { name: 'Lane Johnson', aliases: ['Lane Johnson'], teamId: 'eagles' },
  { name: 'Jalen Carter', aliases: ['Jalen Carter'], teamId: 'eagles' },
  { name: 'Darius Slay', aliases: ['Slay', 'Darius Slay', 'Big Play Slay'], teamId: 'eagles' },
  { name: 'Zach Ertz', aliases: ['Ertz', 'Zach Ertz'], teamId: 'eagles' },
  { name: 'Brandon Graham', aliases: ['Brandon Graham'], teamId: 'eagles' },

  // ── NFL: Giants ────────────────────────────────────────────────────────────
  { name: 'Daniel Jones', aliases: ['Daniel Jones', 'DJ'], teamId: 'giants' },
  { name: 'Malik Nabers', aliases: ['Malik Nabers', 'Nabers'], teamId: 'giants' },
  { name: 'Wan\'Dale Robinson', aliases: ['Wan\'Dale Robinson', 'Wan\'Dale'], teamId: 'giants' },
  { name: 'Dexter Lawrence', aliases: ['Dexter Lawrence', 'Dex'], teamId: 'giants' },
  { name: 'Brian Burns', aliases: ['Brian Burns'], teamId: 'giants' },
  { name: 'Kayvon Thibodeaux', aliases: ['Thibodeaux', 'Kayvon Thibodeaux', 'KT'], teamId: 'giants' },
  { name: 'Evan Neal', aliases: ['Evan Neal'], teamId: 'giants' },
  { name: 'Andrew Thomas', aliases: ['Andrew Thomas'], teamId: 'giants' },

  // ── NFL: Bills ─────────────────────────────────────────────────────────────
  { name: 'Josh Allen', aliases: ['Josh Allen', 'JA17'], teamId: 'bills' },
  { name: 'Stefon Diggs', aliases: ['Stefon Diggs', 'Diggs'], teamId: 'bills' },
  { name: 'Dalton Kincaid', aliases: ['Kincaid', 'Dalton Kincaid'], teamId: 'bills' },
  { name: 'Von Miller', aliases: ['Von Miller', 'Von'], teamId: 'bills' },
  { name: 'Micah Hyde', aliases: ['Micah Hyde', 'Hyde'], teamId: 'bills' },
  { name: 'Jordan Poyer', aliases: ['Jordan Poyer', 'Poyer'], teamId: 'bills' },
  { name: 'Tre\'Davious White', aliases: ['Tre White', 'Tre\'Davious White'], teamId: 'bills' },
  { name: 'James Cook', aliases: ['James Cook', 'J. Cook'], teamId: 'bills' },

  // ── NFL: Dolphins ──────────────────────────────────────────────────────────
  { name: 'Tua Tagovailoa', aliases: ['Tua', 'Tagovailoa', 'Tua Tagovailoa'], teamId: 'dolphins' },
  { name: 'Tyreek Hill', aliases: ['Tyreek', 'Tyreek Hill', 'Cheetah'], teamId: 'dolphins' },
  { name: 'Jaylen Waddle', aliases: ['Waddle', 'Jaylen Waddle'], teamId: 'dolphins' },
  { name: 'Jonnu Smith', aliases: ['Jonnu Smith'], teamId: 'dolphins' },
  { name: 'Bradley Chubb', aliases: ['Bradley Chubb', 'Chubb'], teamId: 'dolphins' },
  { name: 'Jalen Ramsey', aliases: ['Jalen Ramsey', 'Ramsey'], teamId: 'dolphins' },
  { name: 'Christian Wilkins', aliases: ['Christian Wilkins'], teamId: 'dolphins' },

  // ── NFL: Ravens ────────────────────────────────────────────────────────────
  { name: 'Lamar Jackson', aliases: ['Lamar', 'Lamar Jackson', 'LJ'], teamId: 'ravens' },
  { name: 'Zay Flowers', aliases: ['Zay Flowers', 'Zay'], teamId: 'ravens' },
  { name: 'Mark Andrews', aliases: ['Mark Andrews', 'Andrews'], teamId: 'ravens' },
  { name: 'Derrick Henry', aliases: ['Derrick Henry', 'King Henry'], teamId: 'ravens' },
  { name: 'Roquan Smith', aliases: ['Roquan Smith', 'Roquan'], teamId: 'ravens' },
  { name: 'Marlon Humphrey', aliases: ['Marlon Humphrey', 'Humphrey'], teamId: 'ravens' },
  { name: 'Kyle Hamilton', aliases: ['Kyle Hamilton'], teamId: 'ravens' },
  { name: 'Odell Beckham Jr', aliases: ['OBJ', 'Odell Beckham', 'Odell Beckham Jr'], teamId: 'ravens' },

  // ── NFL: Bengals ───────────────────────────────────────────────────────────
  { name: 'Joe Burrow', aliases: ['Joe Burrow', 'Burrow', 'Joey B'], teamId: 'bengals' },
  { name: 'Ja\'Marr Chase', aliases: ['Ja\'Marr Chase', 'Ja\'Marr', 'Chase'], teamId: 'bengals' },
  { name: 'Tee Higgins', aliases: ['Tee Higgins', 'Tee'], teamId: 'bengals' },
  { name: 'Joe Mixon', aliases: ['Joe Mixon', 'Mixon'], teamId: 'bengals' },
  { name: 'Trey Hendrickson', aliases: ['Trey Hendrickson', 'Hendrickson'], teamId: 'bengals' },
  { name: 'Sam Hubbard', aliases: ['Sam Hubbard'], teamId: 'bengals' },
  { name: 'Jessie Bates III', aliases: ['Jessie Bates', 'Bates'], teamId: 'bengals' },

  // ── NFL: Steelers ──────────────────────────────────────────────────────────
  { name: 'Russell Wilson', aliases: ['Russell Wilson', 'Russ'], teamId: 'steelers' },
  { name: 'George Pickens', aliases: ['George Pickens', 'Pickens'], teamId: 'steelers' },
  { name: 'Najee Harris', aliases: ['Najee Harris', 'Najee'], teamId: 'steelers' },
  { name: 'T.J. Watt', aliases: ['TJ Watt', 'T.J. Watt', 'Watt'], teamId: 'steelers' },
  { name: 'Cam Heyward', aliases: ['Cam Heyward', 'Heyward'], teamId: 'steelers' },
  { name: 'Minkah Fitzpatrick', aliases: ['Minkah Fitzpatrick', 'Minkah'], teamId: 'steelers' },
  { name: 'Pat Freiermuth', aliases: ['Pat Freiermuth', 'Freiermuth'], teamId: 'steelers' },

  // ── NFL: Browns ────────────────────────────────────────────────────────────
  { name: 'Deshaun Watson', aliases: ['Deshaun Watson', 'DeShaun Watson'], teamId: 'browns' },
  { name: 'Nick Chubb', aliases: ['Nick Chubb'], teamId: 'browns' },
  { name: 'Amari Cooper', aliases: ['Amari Cooper', 'Amari'], teamId: 'browns' },
  { name: 'Myles Garrett', aliases: ['Myles Garrett', 'Garrett'], teamId: 'browns' },
  { name: 'Denzel Ward', aliases: ['Denzel Ward'], teamId: 'browns' },
  { name: 'Jeremiah Owusu-Koramoah', aliases: ['JOK', 'Owusu-Koramoah'], teamId: 'browns' },

  // ── NFL: Texans ────────────────────────────────────────────────────────────
  { name: 'C.J. Stroud', aliases: ['CJ Stroud', 'C.J. Stroud', 'Stroud'], teamId: 'texans' },
  { name: 'Nico Collins', aliases: ['Nico Collins', 'Nico'], teamId: 'texans' },
  { name: 'Stefon Diggs', aliases: [], teamId: 'texans' }, // Diggs moved to Texans 2024
  { name: 'Will Anderson Jr', aliases: ['Will Anderson', 'Will Anderson Jr'], teamId: 'texans' },
  { name: 'Danielle Hunter', aliases: ['Danielle Hunter', 'Hunter'], teamId: 'texans' },
  { name: 'DeMeco Ryans', aliases: [], teamId: 'texans' },
  { name: 'Joe Mixon', aliases: [], teamId: 'texans' }, // Mixon signed with Texans 2024

  // ── NFL: Colts ─────────────────────────────────────────────────────────────
  { name: 'Anthony Richardson', aliases: ['Anthony Richardson', 'AR'], teamId: 'colts' },
  { name: 'Jonathan Taylor', aliases: ['Jonathan Taylor', 'JT'], teamId: 'colts' },
  { name: 'Michael Pittman Jr', aliases: ['Michael Pittman', 'Pittman'], teamId: 'colts' },
  { name: 'Quenton Nelson', aliases: ['Quenton Nelson'], teamId: 'colts' },
  { name: 'DeForest Buckner', aliases: ['DeForest Buckner', 'Buckner'], teamId: 'colts' },
  { name: 'Shaquille Leonard', aliases: ['Shaq Leonard', 'Darius Leonard'], teamId: 'colts' },

  // ── NFL: Jaguars ───────────────────────────────────────────────────────────
  { name: 'Trevor Lawrence', aliases: ['Trevor Lawrence', 'Lawrence', 'TLaw'], teamId: 'jaguars' },
  { name: 'Calvin Ridley', aliases: ['Calvin Ridley', 'Ridley'], teamId: 'jaguars' },
  { name: 'Evan Engram', aliases: ['Evan Engram', 'Engram'], teamId: 'jaguars' },
  { name: 'Josh Allen', aliases: [], teamId: 'jaguars' }, // Jaguars LB Josh Allen different from Bills QB
  { name: 'Travon Walker', aliases: ['Travon Walker'], teamId: 'jaguars' },
  { name: 'Devin Lloyd', aliases: ['Devin Lloyd'], teamId: 'jaguars' },

  // ── NFL: Titans ────────────────────────────────────────────────────────────
  { name: 'Will Levis', aliases: ['Will Levis', 'Levis'], teamId: 'titans' },
  { name: 'DeAndre Hopkins', aliases: ['DeAndre Hopkins', 'Nuk', 'Hopkins'], teamId: 'titans' },
  { name: 'Tony Pollard', aliases: ['Tony Pollard', 'Pollard'], teamId: 'titans' },
  { name: 'Harold Landry III', aliases: ['Harold Landry', 'Landry'], teamId: 'titans' },
  { name: 'Jeffery Simmons', aliases: ['Jeffery Simmons', 'Simmons'], teamId: 'titans' },

  // ── NFL: Broncos ───────────────────────────────────────────────────────────
  { name: 'Bo Nix', aliases: ['Bo Nix', 'Nix'], teamId: 'broncos' },
  { name: 'Courtland Sutton', aliases: ['Courtland Sutton', 'Sutton'], teamId: 'broncos' },
  { name: 'Jerry Jeudy', aliases: ['Jerry Jeudy', 'Jeudy'], teamId: 'broncos' },
  { name: 'Javonte Williams', aliases: ['Javonte Williams', 'Javonte'], teamId: 'broncos' },
  { name: 'Zach Allen', aliases: ['Zach Allen'], teamId: 'broncos' },
  { name: 'Patrick Surtain II', aliases: ['Patrick Surtain', 'PS2'], teamId: 'broncos' },

  // ── NFL: Raiders ───────────────────────────────────────────────────────────
  { name: 'Aidan O\'Connell', aliases: ['Aidan O\'Connell', 'O\'Connell'], teamId: 'raiders' },
  { name: 'Davante Adams', aliases: ['Davante Adams', 'Tae'], teamId: 'raiders' },
  { name: 'Michael Mayer', aliases: ['Michael Mayer'], teamId: 'raiders' },
  { name: 'Maxx Crosby', aliases: ['Maxx Crosby', 'Crosby'], teamId: 'raiders' },
  { name: 'Luke Nichols', aliases: [], teamId: 'raiders' },

  // ── NFL: Chargers ──────────────────────────────────────────────────────────
  { name: 'Justin Herbert', aliases: ['Justin Herbert', 'Herbert'], teamId: 'chargers' },
  { name: 'Keenan Allen', aliases: ['Keenan Allen', 'Keenan'], teamId: 'chargers' },
  { name: 'Austin Ekeler', aliases: ['Austin Ekeler', 'Ekeler'], teamId: 'chargers' },
  { name: 'Joey Bosa', aliases: ['Joey Bosa', 'Bosa'], teamId: 'chargers' },
  { name: 'Khalil Mack', aliases: ['Khalil Mack', 'Mack'], teamId: 'chargers' },
  { name: 'Derwin James', aliases: ['Derwin James'], teamId: 'chargers' },

  // ── NFL: Cowboys ───────────────────────────────────────────────────────────
  { name: 'Dak Prescott', aliases: ['Dak', 'Dak Prescott', 'Prescott'], teamId: 'cowboys' },
  { name: 'CeeDee Lamb', aliases: ['CeeDee', 'CeeDee Lamb', 'Lamb'], teamId: 'cowboys' },
  { name: 'Micah Parsons', aliases: ['Micah Parsons', 'Parsons'], teamId: 'cowboys' },
  { name: 'Zack Martin', aliases: ['Zack Martin'], teamId: 'cowboys' },
  { name: 'Tony Pollard', aliases: [], teamId: 'cowboys' },
  { name: 'DeMarcus Lawrence', aliases: ['DeMarcus Lawrence', 'Tank'], teamId: 'cowboys' },
  { name: 'Trevon Diggs', aliases: ['Trevon Diggs'], teamId: 'cowboys' },

  // ── NFL: Commanders ───────────────────────────────────────────────────────
  { name: 'Jayden Daniels', aliases: ['Jayden Daniels', 'Daniels'], teamId: 'commanders' },
  { name: 'Terry McLaurin', aliases: ['Terry McLaurin', 'Scary Terry', 'McLaurin'], teamId: 'commanders' },
  { name: 'Brian Robinson', aliases: ['Brian Robinson', 'B-Rob'], teamId: 'commanders' },
  { name: 'Montez Sweat', aliases: ['Montez Sweat', 'Sweat'], teamId: 'commanders' },
  { name: 'Jonathan Allen', aliases: ['Jonathan Allen'], teamId: 'commanders' },

  // ── NFL: Bears ─────────────────────────────────────────────────────────────
  { name: 'Caleb Williams', aliases: ['Caleb Williams', 'Caleb'], teamId: 'bears' },
  { name: 'D.J. Moore', aliases: ['DJ Moore', 'D.J. Moore', 'Moore'], teamId: 'bears' },
  { name: 'Keenan Allen', aliases: [], teamId: 'bears' }, // Allen moved to Bears
  { name: 'Rome Odunze', aliases: ['Rome Odunze', 'Odunze'], teamId: 'bears' },
  { name: 'Montez Sweat', aliases: [], teamId: 'bears' },
  { name: 'Kevin Byard', aliases: ['Kevin Byard', 'Byard'], teamId: 'bears' },

  // ── NFL: Lions ─────────────────────────────────────────────────────────────
  { name: 'Jared Goff', aliases: ['Jared Goff', 'Goff'], teamId: 'lions' },
  { name: 'Amon-Ra St. Brown', aliases: ['Amon-Ra', 'Amon-Ra St. Brown', 'ARSB'], teamId: 'lions' },
  { name: 'Sam LaPorta', aliases: ['Sam LaPorta', 'LaPorta'], teamId: 'lions' },
  { name: 'David Montgomery', aliases: ['David Montgomery', 'Monty'], teamId: 'lions' },
  { name: 'Jahmyr Gibbs', aliases: ['Jahmyr Gibbs', 'Gibbs'], teamId: 'lions' },
  { name: 'Aidan Hutchinson', aliases: ['Aidan Hutchinson', 'Hutch'], teamId: 'lions' },
  { name: 'Penei Sewell', aliases: ['Penei Sewell', 'Sewell'], teamId: 'lions' },

  // ── NFL: Packers ───────────────────────────────────────────────────────────
  { name: 'Jordan Love', aliases: ['Jordan Love', 'Love'], teamId: 'packers' },
  { name: 'Jayden Reed', aliases: ['Jayden Reed', 'Reed'], teamId: 'packers' },
  { name: 'Christian Watson', aliases: ['Christian Watson', 'Watson'], teamId: 'packers' },
  { name: 'Tucker Kraft', aliases: ['Tucker Kraft'], teamId: 'packers' },
  { name: 'Rashan Gary', aliases: ['Rashan Gary', 'Gary'], teamId: 'packers' },
  { name: 'Jaire Alexander', aliases: ['Jaire Alexander', 'Jaire'], teamId: 'packers' },

  // ── NFL: Vikings ───────────────────────────────────────────────────────────
  { name: 'Sam Darnold', aliases: ['Sam Darnold', 'Darnold'], teamId: 'vikings' },
  { name: 'Justin Jefferson', aliases: ['Justin Jefferson', 'Jefferson', 'JJ'], teamId: 'vikings' },
  { name: 'Jordan Addison', aliases: ['Jordan Addison', 'Addison'], teamId: 'vikings' },
  { name: 'T.J. Hockenson', aliases: ['TJ Hockenson', 'Hockenson'], teamId: 'vikings' },
  { name: 'Harrison Smith', aliases: ['Harrison Smith'], teamId: 'vikings' },
  { name: 'Danielle Hunter', aliases: [], teamId: 'vikings' },
  { name: 'Andrew Van Ginkel', aliases: ['Andrew Van Ginkel'], teamId: 'vikings' },

  // ── NFL: Falcons ───────────────────────────────────────────────────────────
  { name: 'Kirk Cousins', aliases: ['Kirk Cousins', 'Cousins'], teamId: 'falcons' },
  { name: 'Drake London', aliases: ['Drake London', 'London'], teamId: 'falcons' },
  { name: 'Kyle Pitts', aliases: ['Kyle Pitts', 'Pitts'], teamId: 'falcons' },
  { name: 'Bijan Robinson', aliases: ['Bijan Robinson', 'Bijan'], teamId: 'falcons' },
  { name: 'Grady Jarrett', aliases: ['Grady Jarrett', 'Jarrett'], teamId: 'falcons' },
  { name: 'Jessie Bates III', aliases: [], teamId: 'falcons' },

  // ── NFL: Panthers ──────────────────────────────────────────────────────────
  { name: 'Bryce Young', aliases: ['Bryce Young', 'Bryce'], teamId: 'panthers' },
  { name: 'Adam Thielen', aliases: ['Adam Thielen', 'Thielen'], teamId: 'panthers' },
  { name: 'Miles Sanders', aliases: ['Miles Sanders', 'Sanders'], teamId: 'panthers' },
  { name: 'Brian Burns', aliases: [], teamId: 'panthers' },
  { name: 'Derrick Brown', aliases: ['Derrick Brown'], teamId: 'panthers' },

  // ── NFL: Saints ────────────────────────────────────────────────────────────
  { name: 'Derek Carr', aliases: ['Derek Carr', 'Carr'], teamId: 'saints' },
  { name: 'Chris Olave', aliases: ['Chris Olave', 'Olave'], teamId: 'saints' },
  { name: 'Michael Thomas', aliases: ['Michael Thomas', 'MT'], teamId: 'saints' },
  { name: 'Alvin Kamara', aliases: ['Alvin Kamara', 'Kamara', 'AK'], teamId: 'saints' },
  { name: 'Cam Jordan', aliases: ['Cam Jordan'], teamId: 'saints' },
  { name: 'Marshon Lattimore', aliases: ['Marshon Lattimore', 'Lattimore'], teamId: 'saints' },

  // ── NFL: Buccaneers ────────────────────────────────────────────────────────
  { name: 'Baker Mayfield', aliases: ['Baker Mayfield', 'Baker'], teamId: 'buccaneers' },
  { name: 'Mike Evans', aliases: ['Mike Evans', 'Evans'], teamId: 'buccaneers' },
  { name: 'Chris Godwin', aliases: ['Chris Godwin', 'Godwin'], teamId: 'buccaneers' },
  { name: 'Rachaad White', aliases: ['Rachaad White'], teamId: 'buccaneers' },
  { name: 'Vince Young', aliases: [], teamId: 'buccaneers' },
  { name: 'Lavonte David', aliases: ['Lavonte David', 'David'], teamId: 'buccaneers' },
  { name: 'Vita Vea', aliases: ['Vita Vea', 'Vea'], teamId: 'buccaneers' },

  // ── NFL: Cardinals ─────────────────────────────────────────────────────────
  { name: 'Kyler Murray', aliases: ['Kyler Murray', 'Kyler', 'Murray'], teamId: 'az-cardinals' },
  { name: 'Marvin Harrison Jr', aliases: ['Marvin Harrison', 'Marvin Harrison Jr', 'MHJ'], teamId: 'az-cardinals' },
  { name: 'James Conner', aliases: ['James Conner', 'Conner'], teamId: 'az-cardinals' },
  { name: 'Zaven Collins', aliases: ['Zaven Collins'], teamId: 'az-cardinals' },
  { name: 'Budda Baker', aliases: ['Budda Baker', 'Budda'], teamId: 'az-cardinals' },

  // ── NFL: Rams ──────────────────────────────────────────────────────────────
  { name: 'Matthew Stafford', aliases: ['Matthew Stafford', 'Stafford'], teamId: 'rams' },
  { name: 'Cooper Kupp', aliases: ['Cooper Kupp', 'Kupp'], teamId: 'rams' },
  { name: 'Puka Nacua', aliases: ['Puka Nacua', 'Puka'], teamId: 'rams' },
  { name: 'Tyler Higbee', aliases: ['Tyler Higbee', 'Higbee'], teamId: 'rams' },
  { name: 'Aaron Donald', aliases: ['Aaron Donald', 'Donald'], teamId: 'rams' },
  { name: 'Nolan Smith', aliases: [], teamId: 'rams' },
  { name: 'Jalen Ramsey', aliases: [], teamId: 'rams' },

  // ── NFL: 49ers ─────────────────────────────────────────────────────────────
  { name: 'Brock Purdy', aliases: ['Brock Purdy', 'Purdy', 'Mr. Irrelevant'], teamId: 'niners' },
  { name: 'Deebo Samuel', aliases: ['Deebo Samuel', 'Deebo'], teamId: 'niners' },
  { name: 'Brandon Aiyuk', aliases: ['Brandon Aiyuk', 'Aiyuk', 'BDA'], teamId: 'niners' },
  { name: 'George Kittle', aliases: ['George Kittle', 'Kittle'], teamId: 'niners' },
  { name: 'Christian McCaffrey', aliases: ['Christian McCaffrey', 'CMC'], teamId: 'niners' },
  { name: 'Nick Bosa', aliases: ['Nick Bosa'], teamId: 'niners' },
  { name: 'Fred Warner', aliases: ['Fred Warner', 'Warner'], teamId: 'niners' },
  { name: 'Charvarius Ward', aliases: ['Charvarius Ward', 'Mooney'], teamId: 'niners' },

  // ── NFL: Seahawks ──────────────────────────────────────────────────────────
  { name: 'Geno Smith', aliases: ['Geno Smith', 'Geno'], teamId: 'seahawks' },
  { name: 'DK Metcalf', aliases: ['DK Metcalf', 'DK'], teamId: 'seahawks' },
  { name: 'Tyler Lockett', aliases: ['Tyler Lockett', 'Lockett'], teamId: 'seahawks' },
  { name: 'Kenneth Walker III', aliases: ['Kenneth Walker', 'K-Walk', 'Walker'], teamId: 'seahawks' },
  { name: 'Uchenna Nwosu', aliases: ['Uchenna Nwosu'], teamId: 'seahawks' },
  { name: 'Devon Witherspoon', aliases: ['Devon Witherspoon', 'Witherspoon'], teamId: 'seahawks' },

  // ── NBA: Knicks ────────────────────────────────────────────────────────────
  { name: 'Jalen Brunson', aliases: ['Jalen Brunson', 'Brunson', 'JB'], teamId: 'knicks' },
  { name: 'Karl-Anthony Towns', aliases: ['Karl-Anthony Towns', 'KAT', 'Towns'], teamId: 'knicks' },
  { name: 'OG Anunoby', aliases: ['OG Anunoby', 'OG'], teamId: 'knicks' },
  { name: 'Josh Hart', aliases: ['Josh Hart', 'Hart'], teamId: 'knicks' },
  { name: 'Mikal Bridges', aliases: ['Mikal Bridges', 'Bridges'], teamId: 'knicks' },
  { name: 'Julius Randle', aliases: ['Julius Randle', 'Randle'], teamId: 'knicks' },
  { name: 'Mitchell Robinson', aliases: ['Mitchell Robinson', 'Mitch'], teamId: 'knicks' },
  { name: 'Precious Achiuwa', aliases: ['Precious Achiuwa', 'Precious'], teamId: 'knicks' },
  { name: 'Deuce McBride', aliases: ['Deuce McBride', 'Deuce'], teamId: 'knicks' },

  // ── NBA: Lakers ────────────────────────────────────────────────────────────
  { name: 'LeBron James', aliases: ['LeBron', 'LeBron James', 'King James', 'Bron'], teamId: 'lakers' },
  { name: 'Anthony Davis', aliases: ['Anthony Davis', 'AD', 'The Brow'], teamId: 'lakers' },
  { name: 'Austin Reaves', aliases: ['Austin Reaves', 'AR', 'Hillbilly Kobe'], teamId: 'lakers' },
  { name: 'D\'Angelo Russell', aliases: ['D\'Angelo Russell', 'DLo', 'Russell'], teamId: 'lakers' },
  { name: 'Rui Hachimura', aliases: ['Rui Hachimura', 'Rui'], teamId: 'lakers' },
  { name: 'Jarred Vanderbilt', aliases: ['Jarred Vanderbilt', 'Vando'], teamId: 'lakers' },
  { name: 'Gabe Vincent', aliases: ['Gabe Vincent'], teamId: 'lakers' },
  { name: 'Bronny James', aliases: ['Bronny James', 'Bronny'], teamId: 'lakers' },

  // ── NBA: Warriors ──────────────────────────────────────────────────────────
  { name: 'Stephen Curry', aliases: ['Steph', 'Stephen Curry', 'Curry', 'Chef Curry'], teamId: 'warriors' },
  { name: 'Draymond Green', aliases: ['Draymond Green', 'Draymond'], teamId: 'warriors' },
  { name: 'Klay Thompson', aliases: ['Klay Thompson', 'Klay'], teamId: 'warriors' },
  { name: 'Andrew Wiggins', aliases: ['Andrew Wiggins', 'Wiggins'], teamId: 'warriors' },
  { name: 'Jonathan Kuminga', aliases: ['Jonathan Kuminga', 'Kuminga', 'JK'], teamId: 'warriors' },
  { name: 'Brandin Podziemski', aliases: ['Brandin Podziemski', 'Podz'], teamId: 'warriors' },
  { name: 'Moses Moody', aliases: ['Moses Moody', 'Moses'], teamId: 'warriors' },

  // ── NBA: Celtics ───────────────────────────────────────────────────────────
  { name: 'Jayson Tatum', aliases: ['Jayson Tatum', 'Tatum', 'JT'], teamId: 'celtics' },
  { name: 'Jaylen Brown', aliases: ['Jaylen Brown', 'JB'], teamId: 'celtics' },
  { name: 'Kristaps Porzingis', aliases: ['Kristaps Porzingis', 'KP', 'Porzingis', 'Unicorn'], teamId: 'celtics' },
  { name: 'Jrue Holiday', aliases: ['Jrue Holiday', 'Jrue'], teamId: 'celtics' },
  { name: 'Al Horford', aliases: ['Al Horford', 'Horford'], teamId: 'celtics' },
  { name: 'Payton Pritchard', aliases: ['Payton Pritchard', 'Pritchard', 'PP'], teamId: 'celtics' },
  { name: 'Derrick White', aliases: ['Derrick White', 'D-White'], teamId: 'celtics' },
  { name: 'Sam Hauser', aliases: ['Sam Hauser', 'Hauser'], teamId: 'celtics' },

  // ── NBA: Bucks ─────────────────────────────────────────────────────────────
  { name: 'Giannis Antetokounmpo', aliases: ['Giannis', 'Giannis Antetokounmpo', 'Greek Freak', 'Freak'], teamId: 'bucks' },
  { name: 'Damian Lillard', aliases: ['Damian Lillard', 'Dame', 'Dame Dolla'], teamId: 'bucks' },
  { name: 'Khris Middleton', aliases: ['Khris Middleton', 'Middleton'], teamId: 'bucks' },
  { name: 'Brook Lopez', aliases: ['Brook Lopez', 'Lopez'], teamId: 'bucks' },
  { name: 'Bobby Portis', aliases: ['Bobby Portis', 'Bobby Portis Jr'], teamId: 'bucks' },
  { name: 'Pat Connaughton', aliases: ['Pat Connaughton'], teamId: 'bucks' },
  { name: 'Malik Beasley', aliases: ['Malik Beasley', 'Beasley'], teamId: 'bucks' },

  // ── NBA: 76ers ─────────────────────────────────────────────────────────────
  { name: 'Joel Embiid', aliases: ['Joel Embiid', 'Embiid', 'The Process', 'Jo'], teamId: 'sixers' },
  { name: 'Tyrese Maxey', aliases: ['Tyrese Maxey', 'Maxey'], teamId: 'sixers' },
  { name: 'Paul George', aliases: ['Paul George', 'PG13', 'PG'], teamId: 'sixers' },
  { name: 'Kelly Oubre Jr', aliases: ['Kelly Oubre', 'Oubre'], teamId: 'sixers' },
  { name: 'Andre Drummond', aliases: ['Andre Drummond', 'Drummond'], teamId: 'sixers' },
  { name: 'Cameron Payne', aliases: ['Cameron Payne', 'Payne'], teamId: 'sixers' },

  // ── NBA: Cavaliers ─────────────────────────────────────────────────────────
  { name: 'Donovan Mitchell', aliases: ['Donovan Mitchell', 'Spida', 'Mitchell'], teamId: 'cavaliers' },
  { name: 'Darius Garland', aliases: ['Darius Garland', 'Garland'], teamId: 'cavaliers' },
  { name: 'Evan Mobley', aliases: ['Evan Mobley', 'Mobley'], teamId: 'cavaliers' },
  { name: 'Jarrett Allen', aliases: ['Jarrett Allen', 'Allen'], teamId: 'cavaliers' },
  { name: 'Max Strus', aliases: ['Max Strus', 'Strus'], teamId: 'cavaliers' },
  { name: 'Caris LeVert', aliases: ['Caris LeVert', 'LeVert'], teamId: 'cavaliers' },

  // ── NBA: Heat ──────────────────────────────────────────────────────────────
  { name: 'Jimmy Butler', aliases: ['Jimmy Butler', 'Jimmy', 'Jimmy Buckets'], teamId: 'heat' },
  { name: 'Bam Adebayo', aliases: ['Bam Adebayo', 'Bam'], teamId: 'heat' },
  { name: 'Tyler Herro', aliases: ['Tyler Herro', 'Herro'], teamId: 'heat' },
  { name: 'Caleb Martin', aliases: ['Caleb Martin', 'Martin'], teamId: 'heat' },
  { name: 'Kyle Lowry', aliases: ['Kyle Lowry', 'Lowry'], teamId: 'heat' },
  { name: 'Duncan Robinson', aliases: ['Duncan Robinson', 'Robinson'], teamId: 'heat' },
  { name: 'Nikola Jovic', aliases: ['Nikola Jovic', 'Jovic'], teamId: 'heat' },

  // ── NBA: Nuggets ───────────────────────────────────────────────────────────
  { name: 'Nikola Jokic', aliases: ['Nikola Jokic', 'Jokic', 'Joker'], teamId: 'nuggets' },
  { name: 'Jamal Murray', aliases: ['Jamal Murray', 'Murray', 'Blue Arrow'], teamId: 'nuggets' },
  { name: 'Michael Porter Jr', aliases: ['Michael Porter Jr', 'MPJ'], teamId: 'nuggets' },
  { name: 'Aaron Gordon', aliases: ['Aaron Gordon', 'AG'], teamId: 'nuggets' },
  { name: 'Kentavious Caldwell-Pope', aliases: ['Kentavious Caldwell-Pope', 'KCP'], teamId: 'nuggets' },
  { name: 'Christian Braun', aliases: ['Christian Braun', 'Braun'], teamId: 'nuggets' },
  { name: 'Reggie Jackson', aliases: ['Reggie Jackson'], teamId: 'nuggets' },

  // ── NBA: Timberwolves ──────────────────────────────────────────────────────
  { name: 'Anthony Edwards', aliases: ['Anthony Edwards', 'Ant', 'Ant-Man', 'Edwards'], teamId: 'timberwolves' },
  { name: 'Karl-Anthony Towns', aliases: [], teamId: 'timberwolves' },
  { name: 'Rudy Gobert', aliases: ['Rudy Gobert', 'Gobert', 'Stifle Tower'], teamId: 'timberwolves' },
  { name: 'Mike Conley', aliases: ['Mike Conley', 'Conley'], teamId: 'timberwolves' },
  { name: 'Jaden McDaniels', aliases: ['Jaden McDaniels', 'McDaniels'], teamId: 'timberwolves' },
  { name: 'Naz Reid', aliases: ['Naz Reid', 'Reid'], teamId: 'timberwolves' },

  // ── NBA: Thunder ───────────────────────────────────────────────────────────
  { name: 'Shai Gilgeous-Alexander', aliases: ['Shai Gilgeous-Alexander', 'SGA', 'Shai'], teamId: 'thunder' },
  { name: 'Chet Holmgren', aliases: ['Chet Holmgren', 'Chet', 'Holmgren'], teamId: 'thunder' },
  { name: 'Jalen Williams', aliases: ['Jalen Williams', 'Jalen W', 'J-Dub'], teamId: 'thunder' },
  { name: 'Josh Giddey', aliases: ['Josh Giddey', 'Giddey'], teamId: 'thunder' },
  { name: 'Luguentz Dort', aliases: ['Luguentz Dort', 'Lu Dort', 'Dort'], teamId: 'thunder' },
  { name: 'Isaiah Joe', aliases: ['Isaiah Joe'], teamId: 'thunder' },

  // ── NBA: Mavericks ─────────────────────────────────────────────────────────
  { name: 'Luka Doncic', aliases: ['Luka Doncic', 'Luka', 'Luka Magic', 'Doncic'], teamId: 'mavs' },
  { name: 'Kyrie Irving', aliases: ['Kyrie Irving', 'Kyrie', 'KAI', 'Uncle Drew'], teamId: 'mavs' },
  { name: 'Tim Hardaway Jr', aliases: ['Tim Hardaway', 'Tim Hardaway Jr'], teamId: 'mavs' },
  { name: 'Daniel Gafford', aliases: ['Daniel Gafford', 'Gafford'], teamId: 'mavs' },
  { name: 'Maxi Kleber', aliases: ['Maxi Kleber', 'Kleber'], teamId: 'mavs' },
  { name: 'Dante Exum', aliases: ['Dante Exum', 'Exum'], teamId: 'mavs' },

  // ── NBA: Spurs ─────────────────────────────────────────────────────────────
  { name: 'Victor Wembanyama', aliases: ['Victor Wembanyama', 'Wemby', 'Wembanyama'], teamId: 'spurs' },
  { name: 'Devin Vassell', aliases: ['Devin Vassell', 'Vassell'], teamId: 'spurs' },
  { name: 'Keldon Johnson', aliases: ['Keldon Johnson', 'Keldon'], teamId: 'spurs' },
  { name: 'Tre Jones', aliases: ['Tre Jones'], teamId: 'spurs' },
  { name: 'Jeremy Sochan', aliases: ['Jeremy Sochan', 'Sochan'], teamId: 'spurs' },
  { name: 'Zach Collins', aliases: ['Zach Collins'], teamId: 'spurs' },

  // ── NBA: Rockets ───────────────────────────────────────────────────────────
  { name: 'Alperen Sengun', aliases: ['Alperen Sengun', 'Sengun'], teamId: 'rockets' },
  { name: 'Jalen Green', aliases: ['Jalen Green', 'Jalen G', 'Green'], teamId: 'rockets' },
  { name: 'Jabari Smith Jr', aliases: ['Jabari Smith', 'Jabari Smith Jr'], teamId: 'rockets' },
  { name: 'Fred VanVleet', aliases: ['Fred VanVleet', 'FVV', 'VanVleet'], teamId: 'rockets' },
  { name: 'Dillon Brooks', aliases: ['Dillon Brooks', 'Brooks'], teamId: 'rockets' },
  { name: 'Tari Eason', aliases: ['Tari Eason', 'Eason'], teamId: 'rockets' },

  // ── NBA: Suns ──────────────────────────────────────────────────────────────
  { name: 'Kevin Durant', aliases: ['Kevin Durant', 'KD', 'Durant', 'Slim Reaper'], teamId: 'suns' },
  { name: 'Bradley Beal', aliases: ['Bradley Beal', 'Beal', 'Brad Beal'], teamId: 'suns' },
  { name: 'Devin Booker', aliases: ['Devin Booker', 'Booker', 'Book'], teamId: 'suns' },
  { name: 'Jusuf Nurkic', aliases: ['Jusuf Nurkic', 'Nurkic', 'Nurk'], teamId: 'suns' },
  { name: 'Grayson Allen', aliases: ['Grayson Allen'], teamId: 'suns' },
  { name: 'Eric Gordon', aliases: ['Eric Gordon'], teamId: 'suns' },

  // ── NBA: Clippers ──────────────────────────────────────────────────────────
  { name: 'Kawhi Leonard', aliases: ['Kawhi Leonard', 'Kawhi', 'The Klaw', 'Board Man'], teamId: 'clippers' },
  { name: 'Paul George', aliases: [], teamId: 'clippers' },
  { name: 'James Harden', aliases: ['James Harden', 'Harden', 'The Beard'], teamId: 'clippers' },
  { name: 'Russell Westbrook', aliases: ['Russell Westbrook', 'Russ', 'Westbrook'], teamId: 'clippers' },
  { name: 'Ivica Zubac', aliases: ['Ivica Zubac', 'Zubac', 'Zubac Attack'], teamId: 'clippers' },
  { name: 'Norman Powell', aliases: ['Norman Powell', 'Norm Powell', 'Powell'], teamId: 'clippers' },

  // ── NBA: Grizzlies ─────────────────────────────────────────────────────────
  { name: 'Ja Morant', aliases: ['Ja Morant', 'Ja', 'Morant'], teamId: 'grizzlies' },
  { name: 'Jaren Jackson Jr', aliases: ['Jaren Jackson Jr', 'JJJ', 'Jaren Jackson'], teamId: 'grizzlies' },
  { name: 'Desmond Bane', aliases: ['Desmond Bane', 'Bane'], teamId: 'grizzlies' },
  { name: 'Santi Aldama', aliases: ['Santi Aldama', 'Aldama'], teamId: 'grizzlies' },
  { name: 'Luke Kennard', aliases: ['Luke Kennard', 'Kennard'], teamId: 'grizzlies' },
  { name: 'Marcus Smart', aliases: ['Marcus Smart', 'Smart'], teamId: 'grizzlies' },

  // ── NBA: Pelicans ──────────────────────────────────────────────────────────
  { name: 'Zion Williamson', aliases: ['Zion Williamson', 'Zion', 'Williamson'], teamId: 'pelicans' },
  { name: 'Brandon Ingram', aliases: ['Brandon Ingram', 'BI', 'Ingram'], teamId: 'pelicans' },
  { name: 'CJ McCollum', aliases: ['CJ McCollum', 'CJ'], teamId: 'pelicans' },
  { name: 'Herb Jones', aliases: ['Herb Jones', 'Herb'], teamId: 'pelicans' },
  { name: 'Jonas Valanciunas', aliases: ['Jonas Valanciunas', 'JV'], teamId: 'pelicans' },

  // ── MLB: Yankees ───────────────────────────────────────────────────────────
  { name: 'Aaron Judge', aliases: ['Aaron Judge', 'Judge', 'All Rise'], teamId: 'yankees' },
  { name: 'Juan Soto', aliases: ['Juan Soto', 'Soto'], teamId: 'yankees' },
  { name: 'Gerrit Cole', aliases: ['Gerrit Cole', 'Cole'], teamId: 'yankees' },
  { name: 'Gleyber Torres', aliases: ['Gleyber Torres', 'Torres', 'Gleyber'], teamId: 'yankees' },
  { name: 'Giancarlo Stanton', aliases: ['Giancarlo Stanton', 'Stanton', 'G-Stanton'], teamId: 'yankees' },
  { name: 'Anthony Volpe', aliases: ['Anthony Volpe', 'Volpe'], teamId: 'yankees' },
  { name: 'Carlos Rodon', aliases: ['Carlos Rodon', 'Rodon'], teamId: 'yankees' },
  { name: 'Clay Holmes', aliases: ['Clay Holmes', 'Holmes'], teamId: 'yankees' },
  { name: 'DJ LeMahieu', aliases: ['DJ LeMahieu', 'LeMahieu'], teamId: 'yankees' },
  { name: 'Nestor Cortes', aliases: ['Nestor Cortes', 'Cortes'], teamId: 'yankees' },

  // ── MLB: Red Sox ───────────────────────────────────────────────────────────
  { name: 'Rafael Devers', aliases: ['Rafael Devers', 'Devers', 'Carita'], teamId: 'red-sox' },
  { name: 'Triston Casas', aliases: ['Triston Casas', 'Casas'], teamId: 'red-sox' },
  { name: 'Wilyer Abreu', aliases: ['Wilyer Abreu', 'Abreu'], teamId: 'red-sox' },
  { name: 'Garrett Whitlock', aliases: ['Garrett Whitlock', 'Whitlock'], teamId: 'red-sox' },
  { name: 'Kenley Jansen', aliases: ['Kenley Jansen', 'Jansen'], teamId: 'red-sox' },
  { name: 'Brayan Bello', aliases: ['Brayan Bello', 'Bello'], teamId: 'red-sox' },

  // ── MLB: Blue Jays ─────────────────────────────────────────────────────────
  { name: 'Vladimir Guerrero Jr', aliases: ['Vladimir Guerrero Jr', 'Vladdy', 'Vlad Jr', 'Guerrero'], teamId: 'blue-jays' },
  { name: 'Bo Bichette', aliases: ['Bo Bichette', 'Bichette', 'Bo'], teamId: 'blue-jays' },
  { name: 'Kevin Gausman', aliases: ['Kevin Gausman', 'Gausman'], teamId: 'blue-jays' },
  { name: 'Alejandro Kirk', aliases: ['Alejandro Kirk', 'Kirk'], teamId: 'blue-jays' },
  { name: 'George Springer', aliases: ['George Springer', 'Springer'], teamId: 'blue-jays' },

  // ── MLB: Orioles ───────────────────────────────────────────────────────────
  { name: 'Gunnar Henderson', aliases: ['Gunnar Henderson', 'Henderson', 'Gunnar'], teamId: 'orioles' },
  { name: 'Adley Rutschman', aliases: ['Adley Rutschman', 'Rutschman', 'Adley'], teamId: 'orioles' },
  { name: 'Corbin Burnes', aliases: ['Corbin Burnes', 'Burnes'], teamId: 'orioles' },
  { name: 'Felix Bautista', aliases: ['Felix Bautista', 'Bautista'], teamId: 'orioles' },
  { name: 'Ryan Mountcastle', aliases: ['Ryan Mountcastle', 'Mountcastle'], teamId: 'orioles' },
  { name: 'Anthony Santander', aliases: ['Anthony Santander', 'Santander'], teamId: 'orioles' },

  // ── MLB: Rays ──────────────────────────────────────────────────────────────
  { name: 'Randy Arozarena', aliases: ['Randy Arozarena', 'Arozarena'], teamId: 'rays' },
  { name: 'Shane McClanahan', aliases: ['Shane McClanahan', 'McClanahan'], teamId: 'rays' },
  { name: 'Yandy Diaz', aliases: ['Yandy Diaz', 'Yandy'], teamId: 'rays' },
  { name: 'Zach Eflin', aliases: ['Zach Eflin', 'Eflin'], teamId: 'rays' },
  { name: 'Taj Bradley', aliases: ['Taj Bradley', 'Bradley'], teamId: 'rays' },

  // ── MLB: Astros ────────────────────────────────────────────────────────────
  { name: 'Jose Altuve', aliases: ['Jose Altuve', 'Altuve'], teamId: 'astros' },
  { name: 'Kyle Tucker', aliases: ['Kyle Tucker', 'Tucker'], teamId: 'astros' },
  { name: 'Yordan Alvarez', aliases: ['Yordan Alvarez', 'Yordan', 'Alvarez'], teamId: 'astros' },
  { name: 'Framber Valdez', aliases: ['Framber Valdez', 'Valdez', 'Framber'], teamId: 'astros' },
  { name: 'Justin Verlander', aliases: ['Justin Verlander', 'Verlander', 'JV'], teamId: 'astros' },
  { name: 'Ryan Pressly', aliases: ['Ryan Pressly', 'Pressly'], teamId: 'astros' },
  { name: 'Alex Bregman', aliases: ['Alex Bregman', 'Bregman'], teamId: 'astros' },
  { name: 'Jeremy Pena', aliases: ['Jeremy Pena', 'Pena'], teamId: 'astros' },

  // ── MLB: Angels ────────────────────────────────────────────────────────────
  { name: 'Shohei Ohtani', aliases: ['Shohei Ohtani', 'Ohtani', 'Shohei', 'Sho-Time', 'Shotime'], teamId: 'dodgers' }, // Ohtani moved to Dodgers 2024
  { name: 'Mike Trout', aliases: ['Mike Trout', 'Trout', 'The Millville Meteor'], teamId: 'angels' },
  { name: 'Anthony Rendon', aliases: ['Anthony Rendon', 'Rendon'], teamId: 'angels' },
  { name: 'Tyler Anderson', aliases: ['Tyler Anderson'], teamId: 'angels' },

  // ── MLB: Mariners ──────────────────────────────────────────────────────────
  { name: 'Julio Rodriguez', aliases: ['Julio Rodriguez', 'J-Rod', 'Julio'], teamId: 'mariners' },
  { name: 'Cal Raleigh', aliases: ['Cal Raleigh', 'Big Dumper', 'Raleigh'], teamId: 'mariners' },
  { name: 'Luis Castillo', aliases: ['Luis Castillo', 'Castillo'], teamId: 'mariners' },
  { name: 'George Kirby', aliases: ['George Kirby', 'Kirby'], teamId: 'mariners' },
  { name: 'Ty France', aliases: ['Ty France', 'France'], teamId: 'mariners' },

  // ── MLB: Texas Rangers ─────────────────────────────────────────────────────
  { name: 'Corey Seager', aliases: ['Corey Seager', 'Seager'], teamId: 'tex-rangers' },
  { name: 'Marcus Semien', aliases: ['Marcus Semien', 'Semien'], teamId: 'tex-rangers' },
  { name: 'Adolis Garcia', aliases: ['Adolis Garcia', 'El Bombi', 'Garcia'], teamId: 'tex-rangers' },
  { name: 'Nathan Eovaldi', aliases: ['Nathan Eovaldi', 'Eovaldi'], teamId: 'tex-rangers' },
  { name: 'Jacob deGrom', aliases: ['Jacob deGrom', 'deGrom', 'deGrom'], teamId: 'tex-rangers' },

  // ── MLB: Guardians ─────────────────────────────────────────────────────────
  { name: 'Jose Ramirez', aliases: ['Jose Ramirez', 'J-Ram', 'Ramirez'], teamId: 'guardians' },
  { name: 'Shane Bieber', aliases: ['Shane Bieber', 'Bieber'], teamId: 'guardians' },
  { name: 'Emmanuel Clase', aliases: ['Emmanuel Clase', 'Clase'], teamId: 'guardians' },
  { name: 'Josh Naylor', aliases: ['Josh Naylor', 'Naylor'], teamId: 'guardians' },
  { name: 'Steven Kwan', aliases: ['Steven Kwan', 'Kwan'], teamId: 'guardians' },

  // ── MLB: Twins ─────────────────────────────────────────────────────────────
  { name: 'Byron Buxton', aliases: ['Byron Buxton', 'Buxton', 'Buck'], teamId: 'twins' },
  { name: 'Carlos Correa', aliases: ['Carlos Correa', 'Correa'], teamId: 'twins' },
  { name: 'Sonny Gray', aliases: ['Sonny Gray', 'Gray'], teamId: 'twins' },
  { name: 'Pablo Lopez', aliases: ['Pablo Lopez', 'Lopez'], teamId: 'twins' },
  { name: 'Royce Lewis', aliases: ['Royce Lewis', 'Royce'], teamId: 'twins' },

  // ── MLB: Royals ────────────────────────────────────────────────────────────
  { name: 'Bobby Witt Jr', aliases: ['Bobby Witt Jr', 'Bobby Witt', 'Witt'], teamId: 'royals' },
  { name: 'Salvador Perez', aliases: ['Salvador Perez', 'Salvy', 'Perez'], teamId: 'royals' },
  { name: 'Seth Lugo', aliases: ['Seth Lugo', 'Lugo'], teamId: 'royals' },
  { name: 'Cole Ragans', aliases: ['Cole Ragans', 'Ragans'], teamId: 'royals' },
  { name: 'MJ Melendez', aliases: ['MJ Melendez', 'Melendez'], teamId: 'royals' },

  // ── MLB: Braves ────────────────────────────────────────────────────────────
  { name: 'Ronald Acuna Jr', aliases: ['Ronald Acuna Jr', 'Ronald Acuna', 'Acuna', 'La Arana'], teamId: 'braves' },
  { name: 'Matt Olson', aliases: ['Matt Olson', 'Olson'], teamId: 'braves' },
  { name: 'Austin Riley', aliases: ['Austin Riley', 'Riley'], teamId: 'braves' },
  { name: 'Max Fried', aliases: ['Max Fried', 'Fried'], teamId: 'braves' },
  { name: 'Spencer Strider', aliases: ['Spencer Strider', 'Strider'], teamId: 'braves' },
  { name: 'Ozzie Albies', aliases: ['Ozzie Albies', 'Albies', 'Ozzie'], teamId: 'braves' },
  { name: 'Marcell Ozuna', aliases: ['Marcell Ozuna', 'Ozuna', 'El Oso Blanco'], teamId: 'braves' },

  // ── MLB: Mets ──────────────────────────────────────────────────────────────
  { name: 'Francisco Lindor', aliases: ['Francisco Lindor', 'Lindor', 'Mr. Smile'], teamId: 'mets' },
  { name: 'Pete Alonso', aliases: ['Pete Alonso', 'Alonso', 'Polar Bear'], teamId: 'mets' },
  { name: 'Kodai Senga', aliases: ['Kodai Senga', 'Senga'], teamId: 'mets' },
  { name: 'Jose Quintana', aliases: ['Jose Quintana', 'Quintana'], teamId: 'mets' },
  { name: 'Brandon Nimmo', aliases: ['Brandon Nimmo', 'Nimmo'], teamId: 'mets' },
  { name: 'Starling Marte', aliases: ['Starling Marte', 'Marte'], teamId: 'mets' },

  // ── MLB: Phillies ──────────────────────────────────────────────────────────
  { name: 'Bryce Harper', aliases: ['Bryce Harper', 'Harper', 'BRHARP'], teamId: 'phillies' },
  { name: 'Trea Turner', aliases: ['Trea Turner', 'Turner', 'Trea'], teamId: 'phillies' },
  { name: 'Kyle Schwarber', aliases: ['Kyle Schwarber', 'Schwarber', 'Schwarbomb'], teamId: 'phillies' },
  { name: 'Zack Wheeler', aliases: ['Zack Wheeler', 'Wheeler'], teamId: 'phillies' },
  { name: 'Aaron Nola', aliases: ['Aaron Nola', 'Nola'], teamId: 'phillies' },
  { name: 'Alec Bohm', aliases: ['Alec Bohm', 'Bohm'], teamId: 'phillies' },

  // ── MLB: Dodgers ───────────────────────────────────────────────────────────
  { name: 'Mookie Betts', aliases: ['Mookie Betts', 'Mookie', 'Betts'], teamId: 'dodgers' },
  { name: 'Freddie Freeman', aliases: ['Freddie Freeman', 'Freeman', 'Freddie'], teamId: 'dodgers' },
  { name: 'Clayton Kershaw', aliases: ['Clayton Kershaw', 'Kershaw', 'The Claw'], teamId: 'dodgers' },
  { name: 'Walker Buehler', aliases: ['Walker Buehler', 'Buehler'], teamId: 'dodgers' },
  { name: 'Yoshinobu Yamamoto', aliases: ['Yoshinobu Yamamoto', 'Yamamoto'], teamId: 'dodgers' },
  { name: 'James Outman', aliases: ['James Outman', 'Outman'], teamId: 'dodgers' },
  { name: 'Will Smith', aliases: [], teamId: 'dodgers' }, // Dodgers catcher Will Smith

  // ── MLB: Padres ────────────────────────────────────────────────────────────
  { name: 'Fernando Tatis Jr', aliases: ['Fernando Tatis Jr', 'Tatis', 'El Nino'], teamId: 'padres' },
  { name: 'Manny Machado', aliases: ['Manny Machado', 'Machado', 'Manny'], teamId: 'padres' },
  { name: 'Blake Snell', aliases: ['Blake Snell', 'Snell'], teamId: 'padres' },
  { name: 'Joe Musgrove', aliases: ['Joe Musgrove', 'Musgrove'], teamId: 'padres' },
  { name: 'Juan Soto', aliases: [], teamId: 'padres' }, // Soto was with Padres before Yankees
  { name: 'Ha-Seong Kim', aliases: ['Ha-Seong Kim', 'HSK'], teamId: 'padres' },
  { name: 'Xander Bogaerts', aliases: ['Xander Bogaerts', 'Bogaerts', 'X'], teamId: 'padres' },

  // ── MLB: Giants (SF) ───────────────────────────────────────────────────────
  { name: 'Logan Webb', aliases: ['Logan Webb', 'Webb'], teamId: 'sf-giants' },
  { name: 'Wilmer Flores', aliases: ['Wilmer Flores', 'Flores'], teamId: 'sf-giants' },
  { name: 'Jung Hoo Lee', aliases: ['Jung Hoo Lee', 'JHL'], teamId: 'sf-giants' },
  { name: 'Matt Chapman', aliases: ['Matt Chapman', 'Chapman'], teamId: 'sf-giants' },
  { name: 'Camilo Doval', aliases: ['Camilo Doval', 'Doval'], teamId: 'sf-giants' },

  // ── MLB: Cubs ──────────────────────────────────────────────────────────────
  { name: 'Dansby Swanson', aliases: ['Dansby Swanson', 'Swanson', 'Dansby'], teamId: 'cubs' },
  { name: 'Ian Happ', aliases: ['Ian Happ', 'Happ'], teamId: 'cubs' },
  { name: 'Marcus Stroman', aliases: ['Marcus Stroman', 'Stroman', 'DGAF'], teamId: 'cubs' },
  { name: 'Seiya Suzuki', aliases: ['Seiya Suzuki', 'Suzuki', 'Seiya'], teamId: 'cubs' },
  { name: 'Nico Hoerner', aliases: ['Nico Hoerner', 'Hoerner', 'Nico'], teamId: 'cubs' },

  // ── MLB: Cardinals ─────────────────────────────────────────────────────────
  { name: 'Nolan Arenado', aliases: ['Nolan Arenado', 'Arenado', 'Nado'], teamId: 'stl-cardinals' },
  { name: 'Paul Goldschmidt', aliases: ['Paul Goldschmidt', 'Goldy', 'Goldschmidt'], teamId: 'stl-cardinals' },
  { name: 'Miles Mikolas', aliases: ['Miles Mikolas', 'Mikolas'], teamId: 'stl-cardinals' },
  { name: 'Willson Contreras', aliases: ['Willson Contreras', 'Contreras'], teamId: 'stl-cardinals' },
  { name: 'Tommy Edman', aliases: ['Tommy Edman', 'Edman'], teamId: 'stl-cardinals' },

  // ── NHL: Rangers ──────────────────────────────────────────────────────────
  { name: 'Artemi Panarin', aliases: ['Artemi Panarin', 'Panarin', 'Breadman'], teamId: 'rangers' },
  { name: 'Chris Kreider', aliases: ['Chris Kreider', 'Kreider', 'CK20'], teamId: 'rangers' },
  { name: 'Mika Zibanejad', aliases: ['Mika Zibanejad', 'Zibanejad', 'Mika'], teamId: 'rangers' },
  { name: 'Adam Fox', aliases: ['Adam Fox', 'Fox'], teamId: 'rangers' },
  { name: 'Igor Shesterkin', aliases: ['Igor Shesterkin', 'Shesterkin', 'Igor'], teamId: 'rangers' },
  { name: 'Vincent Trocheck', aliases: ['Vincent Trocheck', 'Trocheck'], teamId: 'rangers' },
  { name: 'K\'Andre Miller', aliases: ['K\'Andre Miller', 'Miller'], teamId: 'rangers' },
  { name: 'Alexis Lafreniere', aliases: ['Alexis Lafreniere', 'Lafreniere'], teamId: 'rangers' },

  // ── NHL: Bruins ────────────────────────────────────────────────────────────
  { name: 'David Pastrnak', aliases: ['David Pastrnak', 'Pastrnak', 'Pasta'], teamId: 'bruins' },
  { name: 'Brad Marchand', aliases: ['Brad Marchand', 'Marchand', 'Little Ball of Hate'], teamId: 'bruins' },
  { name: 'Patrice Bergeron', aliases: ['Patrice Bergeron', 'Bergeron'], teamId: 'bruins' },
  { name: 'Charlie McAvoy', aliases: ['Charlie McAvoy', 'McAvoy'], teamId: 'bruins' },
  { name: 'Jeremy Swayman', aliases: ['Jeremy Swayman', 'Swayman'], teamId: 'bruins' },
  { name: 'Linus Ullmark', aliases: ['Linus Ullmark', 'Ullmark'], teamId: 'bruins' },
  { name: 'Hampus Lindholm', aliases: ['Hampus Lindholm', 'Lindholm'], teamId: 'bruins' },
  { name: 'Pavel Zacha', aliases: ['Pavel Zacha', 'Zacha'], teamId: 'bruins' },

  // ── NHL: Maple Leafs ──────────────────────────────────────────────────────
  { name: 'Auston Matthews', aliases: ['Auston Matthews', 'Matthews', 'Auston'], teamId: 'maple-leafs' },
  { name: 'Mitch Marner', aliases: ['Mitch Marner', 'Marner', 'Mitch'], teamId: 'maple-leafs' },
  { name: 'William Nylander', aliases: ['William Nylander', 'Nylander', 'Willy'], teamId: 'maple-leafs' },
  { name: 'John Tavares', aliases: ['John Tavares', 'Tavares', 'JT'], teamId: 'maple-leafs' },
  { name: 'TJ Brodie', aliases: ['TJ Brodie', 'Brodie'], teamId: 'maple-leafs' },
  { name: 'Ilya Samsonov', aliases: ['Ilya Samsonov', 'Samsonov'], teamId: 'maple-leafs' },
  { name: 'Morgan Rielly', aliases: ['Morgan Rielly', 'Rielly'], teamId: 'maple-leafs' },

  // ── NHL: Lightning ─────────────────────────────────────────────────────────
  { name: 'Nikita Kucherov', aliases: ['Nikita Kucherov', 'Kucherov', 'Kuch'], teamId: 'lightning' },
  { name: 'Steven Stamkos', aliases: ['Steven Stamkos', 'Stamkos', 'Stammer'], teamId: 'lightning' },
  { name: 'Brayden Point', aliases: ['Brayden Point', 'Point'], teamId: 'lightning' },
  { name: 'Victor Hedman', aliases: ['Victor Hedman', 'Hedman'], teamId: 'lightning' },
  { name: 'Andrei Vasilevskiy', aliases: ['Andrei Vasilevskiy', 'Vasilevskiy', 'The Big Cat'], teamId: 'lightning' },
  { name: 'Ondrej Palat', aliases: ['Ondrej Palat', 'Palat'], teamId: 'lightning' },

  // ── NHL: Avalanche ─────────────────────────────────────────────────────────
  { name: 'Nathan MacKinnon', aliases: ['Nathan MacKinnon', 'MacKinnon', 'Nate Mac'], teamId: 'avalanche' },
  { name: 'Mikko Rantanen', aliases: ['Mikko Rantanen', 'Rantanen', 'Mikko'], teamId: 'avalanche' },
  { name: 'Cale Makar', aliases: ['Cale Makar', 'Makar'], teamId: 'avalanche' },
  { name: 'Gabriel Landeskog', aliases: ['Gabriel Landeskog', 'Landeskog'], teamId: 'avalanche' },
  { name: 'Alexandar Georgiev', aliases: ['Alexandar Georgiev', 'Georgiev'], teamId: 'avalanche' },
  { name: 'Devon Toews', aliases: ['Devon Toews', 'Toews'], teamId: 'avalanche' },
  { name: 'Valeri Nichushkin', aliases: ['Valeri Nichushkin', 'Nichushkin'], teamId: 'avalanche' },

  // ── NHL: Oilers ────────────────────────────────────────────────────────────
  { name: 'Connor McDavid', aliases: ['Connor McDavid', 'McDavid', 'McJesus'], teamId: 'oilers' },
  { name: 'Leon Draisaitl', aliases: ['Leon Draisaitl', 'Draisaitl', 'Leon'], teamId: 'oilers' },
  { name: 'Zach Hyman', aliases: ['Zach Hyman', 'Hyman'], teamId: 'oilers' },
  { name: 'Ryan Nugent-Hopkins', aliases: ['Ryan Nugent-Hopkins', 'RNH', 'Nuge'], teamId: 'oilers' },
  { name: 'Evan Bouchard', aliases: ['Evan Bouchard', 'Bouchard'], teamId: 'oilers' },
  { name: 'Stuart Skinner', aliases: ['Stuart Skinner', 'Skinner'], teamId: 'oilers' },
  { name: 'Connor Brown', aliases: [], teamId: 'oilers' },

  // ── NHL: Panthers (Florida) ────────────────────────────────────────────────
  { name: 'Matthew Tkachuk', aliases: ['Matthew Tkachuk', 'Tkachuk', 'Chucky'], teamId: 'fla-panthers' },
  { name: 'Aleksander Barkov', aliases: ['Aleksander Barkov', 'Barkov', 'Sasha'], teamId: 'fla-panthers' },
  { name: 'Sam Reinhart', aliases: ['Sam Reinhart', 'Reinhart'], teamId: 'fla-panthers' },
  { name: 'Carter Verhaeghe', aliases: ['Carter Verhaeghe', 'Verhaeghe'], teamId: 'fla-panthers' },
  { name: 'Sergei Bobrovsky', aliases: ['Sergei Bobrovsky', 'Bobrovsky', 'Bob'], teamId: 'fla-panthers' },
  { name: 'Aaron Ekblad', aliases: ['Aaron Ekblad', 'Ekblad'], teamId: 'fla-panthers' },
  { name: 'Gustav Forsling', aliases: ['Gustav Forsling', 'Forsling'], teamId: 'fla-panthers' },

  // ── NHL: Golden Knights ────────────────────────────────────────────────────
  { name: 'Jack Eichel', aliases: ['Jack Eichel', 'Eichel'], teamId: 'golden-knights' },
  { name: 'Mark Stone', aliases: ['Mark Stone', 'Stone'], teamId: 'golden-knights' },
  { name: 'Jonathan Marchessault', aliases: ['Jonathan Marchessault', 'Marchessault'], teamId: 'golden-knights' },
  { name: 'Adin Hill', aliases: ['Adin Hill', 'Hill'], teamId: 'golden-knights' },
  { name: 'Alex Pietrangelo', aliases: ['Alex Pietrangelo', 'Pietrangelo'], teamId: 'golden-knights' },
  { name: 'Shea Theodore', aliases: ['Shea Theodore', 'Theodore'], teamId: 'golden-knights' },

  // ── NHL: Canucks ───────────────────────────────────────────────────────────
  { name: 'Elias Pettersson', aliases: ['Elias Pettersson', 'Pettersson', 'EP40'], teamId: 'canucks' },
  { name: 'Quinn Hughes', aliases: ['Quinn Hughes', 'Hughes'], teamId: 'canucks' },
  { name: 'Brock Boeser', aliases: ['Brock Boeser', 'Boeser'], teamId: 'canucks' },
  { name: 'J.T. Miller', aliases: ['JT Miller', 'J.T. Miller', 'Miller'], teamId: 'canucks' },
  { name: 'Thatcher Demko', aliases: ['Thatcher Demko', 'Demko'], teamId: 'canucks' },
  { name: 'Elias Lindholm', aliases: ['Elias Lindholm'], teamId: 'canucks' },

  // ── NHL: Capitals ──────────────────────────────────────────────────────────
  { name: 'Alexander Ovechkin', aliases: ['Alexander Ovechkin', 'Ovechkin', 'Ovi', 'The Great Eight'], teamId: 'capitals' },
  { name: 'Nicklas Backstrom', aliases: ['Nicklas Backstrom', 'Backstrom'], teamId: 'capitals' },
  { name: 'T.J. Oshie', aliases: ['TJ Oshie', 'T.J. Oshie', 'Oshie'], teamId: 'capitals' },
  { name: 'Darcy Kuemper', aliases: ['Darcy Kuemper', 'Kuemper'], teamId: 'capitals' },
  { name: 'John Carlson', aliases: ['John Carlson', 'Carlson'], teamId: 'capitals' },

  // ── NHL: Penguins ──────────────────────────────────────────────────────────
  { name: 'Sidney Crosby', aliases: ['Sidney Crosby', 'Crosby', 'Sid', 'Sid the Kid'], teamId: 'penguins' },
  { name: 'Evgeni Malkin', aliases: ['Evgeni Malkin', 'Malkin', 'Geno'], teamId: 'penguins' },
  { name: 'Jake Guentzel', aliases: ['Jake Guentzel', 'Guentzel'], teamId: 'penguins' },
  { name: 'Kris Letang', aliases: ['Kris Letang', 'Letang'], teamId: 'penguins' },
  { name: 'Tristan Jarry', aliases: ['Tristan Jarry', 'Jarry'], teamId: 'penguins' },

  // ── NHL: Devils ────────────────────────────────────────────────────────────
  { name: 'Jack Hughes', aliases: ['Jack Hughes', 'Jack Hughes'], teamId: 'devils' },
  { name: 'Nico Hischier', aliases: ['Nico Hischier', 'Hischier', 'Nico'], teamId: 'devils' },
  { name: 'Dougie Hamilton', aliases: ['Dougie Hamilton', 'Hamilton'], teamId: 'devils' },
  { name: 'Jesper Bratt', aliases: ['Jesper Bratt', 'Bratt'], teamId: 'devils' },
  { name: 'Vitek Vanecek', aliases: ['Vitek Vanecek', 'Vanecek'], teamId: 'devils' },

  // ── NHL: Hurricanes ────────────────────────────────────────────────────────
  { name: 'Sebastian Aho', aliases: ['Sebastian Aho', 'Aho'], teamId: 'hurricanes' },
  { name: 'Andrei Svechnikov', aliases: ['Andrei Svechnikov', 'Svechnikov'], teamId: 'hurricanes' },
  { name: 'Teuvo Teravainen', aliases: ['Teuvo Teravainen', 'Teravainen'], teamId: 'hurricanes' },
  { name: 'Brent Burns', aliases: ['Brent Burns', 'Burnzie'], teamId: 'hurricanes' },
  { name: 'Frederik Andersen', aliases: ['Frederik Andersen', 'Freddie Andersen'], teamId: 'hurricanes' },

  // ── MLS: Inter Miami ──────────────────────────────────────────────────────
  { name: 'Lionel Messi', aliases: ['Messi', 'Leo Messi', 'La Pulga', 'Lionel Messi'], teamId: 'inter-miami' },
  { name: 'Sergio Busquets', aliases: ['Sergio Busquets', 'Busquets'], teamId: 'inter-miami' },
  { name: 'Jordi Alba', aliases: ['Jordi Alba', 'Alba'], teamId: 'inter-miami' },
  { name: 'Luis Suarez', aliases: ['Luis Suarez', 'Suarez', 'El Pistolero'], teamId: 'inter-miami' },
  { name: 'Leonardo Campana', aliases: ['Leonardo Campana', 'Campana'], teamId: 'inter-miami' },

  // ── MLS: LA Galaxy ────────────────────────────────────────────────────────
  { name: 'Riqui Puig', aliases: ['Riqui Puig', 'Puig'], teamId: 'la-galaxy' },
  { name: 'Gabriel Pec', aliases: ['Gabriel Pec', 'Pec'], teamId: 'la-galaxy' },
  { name: 'Dejan Joveljic', aliases: ['Dejan Joveljic', 'Joveljic'], teamId: 'la-galaxy' },
  { name: 'John Nelson', aliases: ['John Nelson'], teamId: 'la-galaxy' },
  { name: 'Joseph Paintsil', aliases: ['Joseph Paintsil', 'Paintsil'], teamId: 'la-galaxy' },

  // ── MLS: LAFC ──────────────────────────────────────────────────────────────
  { name: 'Carlos Vela', aliases: ['Carlos Vela', 'Vela', 'VELA'], teamId: 'lafc' },
  { name: 'Denis Bouanga', aliases: ['Denis Bouanga', 'Bouanga'], teamId: 'lafc' },
  { name: 'Mateusz Bogusz', aliases: ['Mateusz Bogusz', 'Bogusz'], teamId: 'lafc' },
  { name: 'Timothy Tillman', aliases: ['Timothy Tillman', 'Tillman'], teamId: 'lafc' },

  // ── MLS: Atlanta United ───────────────────────────────────────────────────
  { name: 'Thiago Almada', aliases: ['Thiago Almada', 'Almada'], teamId: 'atlanta-united' },
  { name: 'Giorgos Giakoumakis', aliases: ['Giorgos Giakoumakis', 'Giakoumakis', 'G-Gio'], teamId: 'atlanta-united' },
  { name: 'Alexey Miranchuk', aliases: ['Alexey Miranchuk', 'Miranchuk'], teamId: 'atlanta-united' },

  // ── MLS: Sounders ─────────────────────────────────────────────────────────
  { name: 'Jordan Morris', aliases: ['Jordan Morris', 'Morris'], teamId: 'sounders' },
  { name: 'Raul Ruidiaz', aliases: ['Raul Ruidiaz', 'Ruidiaz'], teamId: 'sounders' },
  { name: 'Stefan Frei', aliases: ['Stefan Frei', 'Frei'], teamId: 'sounders' },
  { name: 'Albert Rusnak', aliases: ['Albert Rusnak', 'Rusnak'], teamId: 'sounders' },

  // ── MLS: Columbus Crew ────────────────────────────────────────────────────
  { name: 'Cucho Hernandez', aliases: ['Cucho Hernandez', 'Cucho', 'Hernandez'], teamId: 'columbus-crew' },
  { name: 'Yaw Yeboah', aliases: ['Yaw Yeboah', 'Yeboah'], teamId: 'columbus-crew' },
  { name: 'Max Arfsten', aliases: ['Max Arfsten'], teamId: 'columbus-crew' },

  // ── MLS: Sporting KC ──────────────────────────────────────────────────────
  { name: 'Alan Pulido', aliases: ['Alan Pulido', 'Pulido'], teamId: 'sporting-kc' },
  { name: 'Daniel Salloi', aliases: ['Daniel Salloi', 'Salloi'], teamId: 'sporting-kc' },

  // ── MLS: Philadelphia Union ───────────────────────────────────────────────
  { name: 'Mikael Uhre', aliases: ['Mikael Uhre', 'Uhre'], teamId: 'philly-union' },
  { name: 'Kai Wagner', aliases: ['Kai Wagner', 'Wagner'], teamId: 'philly-union' },
  { name: 'Daniel Gazdag', aliases: ['Daniel Gazdag', 'Gazdag'], teamId: 'philly-union' },
  { name: 'Quinn Sullivan', aliases: ['Quinn Sullivan', 'Sullivan'], teamId: 'philly-union' },

  // ── EPL: Arsenal ──────────────────────────────────────────────────────────
  { name: 'Bukayo Saka', aliases: ['Bukayo Saka', 'Saka', 'Little Chilli'], teamId: 'arsenal' },
  { name: 'Martin Odegaard', aliases: ['Martin Odegaard', 'Odegaard'], teamId: 'arsenal' },
  { name: 'Gabriel Martinelli', aliases: ['Gabriel Martinelli', 'Martinelli'], teamId: 'arsenal' },
  { name: 'Declan Rice', aliases: ['Declan Rice', 'Dec', 'Rice'], teamId: 'arsenal' },
  { name: 'Kai Havertz', aliases: ['Kai Havertz', 'Havertz'], teamId: 'arsenal' },
  { name: 'William Saliba', aliases: ['William Saliba', 'Saliba'], teamId: 'arsenal' },
  { name: 'Ben White', aliases: ['Ben White', 'White'], teamId: 'arsenal' },
  { name: 'Gabriel Magalhaes', aliases: ['Gabriel Magalhaes', 'Gabriel'], teamId: 'arsenal' },
  { name: 'David Raya', aliases: ['David Raya', 'Raya'], teamId: 'arsenal' },
  { name: 'Leandro Trossard', aliases: ['Leandro Trossard', 'Trossard'], teamId: 'arsenal' },

  // ── EPL: Liverpool ─────────────────────────────────────────────────────────
  { name: 'Mohamed Salah', aliases: ['Mohamed Salah', 'Salah', 'Mo Salah', 'Egyptian King'], teamId: 'liverpool' },
  { name: 'Virgil van Dijk', aliases: ['Virgil van Dijk', 'van Dijk', 'VVD'], teamId: 'liverpool' },
  { name: 'Trent Alexander-Arnold', aliases: ['Trent Alexander-Arnold', 'TAA', 'Trent'], teamId: 'liverpool' },
  { name: 'Darwin Nunez', aliases: ['Darwin Nunez', 'Nunez', 'Darwin'], teamId: 'liverpool' },
  { name: 'Alisson Becker', aliases: ['Alisson Becker', 'Alisson', 'Ali'], teamId: 'liverpool' },
  { name: 'Diogo Jota', aliases: ['Diogo Jota', 'Jota'], teamId: 'liverpool' },
  { name: 'Curtis Jones', aliases: ['Curtis Jones'], teamId: 'liverpool' },
  { name: 'Dominik Szoboszlai', aliases: ['Dominik Szoboszlai', 'Szoboszlai', 'Szobo'], teamId: 'liverpool' },
  { name: 'Alexis Mac Allister', aliases: ['Alexis Mac Allister', 'Mac Allister'], teamId: 'liverpool' },
  { name: 'Luis Diaz', aliases: ['Luis Diaz', 'Diaz'], teamId: 'liverpool' },

  // ── EPL: Manchester City ───────────────────────────────────────────────────
  { name: 'Erling Haaland', aliases: ['Erling Haaland', 'Haaland', 'Cyborg', 'Erling'], teamId: 'man-city' },
  { name: 'Kevin De Bruyne', aliases: ['Kevin De Bruyne', 'De Bruyne', 'KDB'], teamId: 'man-city' },
  { name: 'Phil Foden', aliases: ['Phil Foden', 'Foden', 'Boy from Stockport'], teamId: 'man-city' },
  { name: 'Rodri', aliases: ['Rodri', 'Rodrigo Hernandez'], teamId: 'man-city' },
  { name: 'Jack Grealish', aliases: ['Jack Grealish', 'Grealish'], teamId: 'man-city' },
  { name: 'Bernardo Silva', aliases: ['Bernardo Silva', 'Bernardo'], teamId: 'man-city' },
  { name: 'Ederson', aliases: ['Ederson'], teamId: 'man-city' },
  { name: 'Ruben Dias', aliases: ['Ruben Dias', 'Dias'], teamId: 'man-city' },
  { name: 'Kyle Walker', aliases: ['Kyle Walker', 'Walker'], teamId: 'man-city' },
  { name: 'Jeremy Doku', aliases: ['Jeremy Doku', 'Doku'], teamId: 'man-city' },

  // ── EPL: Manchester United ─────────────────────────────────────────────────
  { name: 'Rasmus Hojlund', aliases: ['Rasmus Hojlund', 'Hojlund'], teamId: 'man-utd' },
  { name: 'Bruno Fernandes', aliases: ['Bruno Fernandes', 'Bruno', 'Fernandes'], teamId: 'man-utd' },
  { name: 'Marcus Rashford', aliases: ['Marcus Rashford', 'Rashford'], teamId: 'man-utd' },
  { name: 'Alejandro Garnacho', aliases: ['Alejandro Garnacho', 'Garnacho'], teamId: 'man-utd' },
  { name: 'Lisandro Martinez', aliases: ['Lisandro Martinez', 'Licha', 'Martinez'], teamId: 'man-utd' },
  { name: 'Andre Onana', aliases: ['Andre Onana', 'Onana'], teamId: 'man-utd' },
  { name: 'Casemiro', aliases: ['Casemiro'], teamId: 'man-utd' },
  { name: 'Mason Mount', aliases: ['Mason Mount', 'Mount'], teamId: 'man-utd' },

  // ── EPL: Chelsea ───────────────────────────────────────────────────────────
  { name: 'Cole Palmer', aliases: ['Cole Palmer', 'Palmer'], teamId: 'chelsea' },
  { name: 'Nicolas Jackson', aliases: ['Nicolas Jackson', 'Jackson'], teamId: 'chelsea' },
  { name: 'Enzo Fernandez', aliases: ['Enzo Fernandez', 'Enzo'], teamId: 'chelsea' },
  { name: 'Reece James', aliases: ['Reece James', 'James'], teamId: 'chelsea' },
  { name: 'Moises Caicedo', aliases: ['Moises Caicedo', 'Caicedo'], teamId: 'chelsea' },
  { name: 'Marc Cucurella', aliases: ['Marc Cucurella', 'Cucurella'], teamId: 'chelsea' },
  { name: 'Robert Sanchez', aliases: ['Robert Sanchez'], teamId: 'chelsea' },
  { name: 'Noni Madueke', aliases: ['Noni Madueke', 'Madueke'], teamId: 'chelsea' },
  { name: 'Conor Gallagher', aliases: ['Conor Gallagher', 'Gallagher'], teamId: 'chelsea' },

  // ── EPL: Tottenham ─────────────────────────────────────────────────────────
  { name: 'Son Heung-min', aliases: ['Son Heung-min', 'Son', 'Sonny'], teamId: 'tottenham' },
  { name: 'James Maddison', aliases: ['James Maddison', 'Maddison', 'Madders'], teamId: 'tottenham' },
  { name: 'Dejan Kulusevski', aliases: ['Dejan Kulusevski', 'Kulusevski', 'Kulu'], teamId: 'tottenham' },
  { name: 'Cristian Romero', aliases: ['Cristian Romero', 'Romero', 'Cuti'], teamId: 'tottenham' },
  { name: 'Guglielmo Vicario', aliases: ['Guglielmo Vicario', 'Vicario'], teamId: 'tottenham' },
  { name: 'Pedro Porro', aliases: ['Pedro Porro', 'Porro'], teamId: 'tottenham' },
  { name: 'Rodrigo Bentancur', aliases: ['Rodrigo Bentancur', 'Bentancur'], teamId: 'tottenham' },
  { name: 'Yves Bissouma', aliases: ['Yves Bissouma', 'Bissouma'], teamId: 'tottenham' },

  // ── EPL: Aston Villa ───────────────────────────────────────────────────────
  { name: 'Ollie Watkins', aliases: ['Ollie Watkins', 'Watkins'], teamId: 'aston-villa' },
  { name: 'Emiliano Martinez', aliases: ['Emiliano Martinez', 'Dibu', 'Martinez'], teamId: 'aston-villa' },
  { name: 'Leon Bailey', aliases: ['Leon Bailey', 'Bailey'], teamId: 'aston-villa' },
  { name: 'Pau Torres', aliases: ['Pau Torres', 'Torres'], teamId: 'aston-villa' },
  { name: 'Douglas Luiz', aliases: ['Douglas Luiz', 'Luiz'], teamId: 'aston-villa' },
  { name: 'John McGinn', aliases: ['John McGinn', 'McGinn'], teamId: 'aston-villa' },
  { name: 'Youri Tielemans', aliases: ['Youri Tielemans', 'Tielemans'], teamId: 'aston-villa' },

  // ── EPL: Newcastle ─────────────────────────────────────────────────────────
  { name: 'Alexander Isak', aliases: ['Alexander Isak', 'Isak'], teamId: 'newcastle' },
  { name: 'Bruno Guimaraes', aliases: ['Bruno Guimaraes', 'Bruno G'], teamId: 'newcastle' },
  { name: 'Anthony Gordon', aliases: ['Anthony Gordon', 'Gordon'], teamId: 'newcastle' },
  { name: 'Nick Pope', aliases: ['Nick Pope', 'Pope'], teamId: 'newcastle' },
  { name: 'Sven Botman', aliases: ['Sven Botman', 'Botman'], teamId: 'newcastle' },
  { name: 'Fabian Schar', aliases: ['Fabian Schar', 'Schar'], teamId: 'newcastle' },

  // ── La Liga: Real Madrid ───────────────────────────────────────────────────
  { name: 'Vinicius Junior', aliases: ['Vinicius Junior', 'Vini Jr', 'Vinicius', 'Vini'], teamId: 'real-madrid' },
  { name: 'Jude Bellingham', aliases: ['Jude Bellingham', 'Bellingham', 'Jude'], teamId: 'real-madrid' },
  { name: 'Kylian Mbappe', aliases: ['Kylian Mbappe', 'Mbappe', 'Kylian'], teamId: 'real-madrid' },
  { name: 'Rodrygo', aliases: ['Rodrygo', 'Rodrygo Goes'], teamId: 'real-madrid' },
  { name: 'Thibaut Courtois', aliases: ['Thibaut Courtois', 'Courtois'], teamId: 'real-madrid' },
  { name: 'David Alaba', aliases: ['David Alaba', 'Alaba'], teamId: 'real-madrid' },
  { name: 'Luka Modric', aliases: ['Luka Modric', 'Modric'], teamId: 'real-madrid' },
  { name: 'Aurelien Tchouameni', aliases: ['Aurelien Tchouameni', 'Tchouameni'], teamId: 'real-madrid' },
  { name: 'Eder Militao', aliases: ['Eder Militao', 'Militao'], teamId: 'real-madrid' },
  { name: 'Brahim Diaz', aliases: ['Brahim Diaz', 'Brahim'], teamId: 'real-madrid' },

  // ── La Liga: Barcelona ─────────────────────────────────────────────────────
  { name: 'Robert Lewandowski', aliases: ['Robert Lewandowski', 'Lewandowski', 'Lewy'], teamId: 'barcelona' },
  { name: 'Pedri', aliases: ['Pedri', 'Pedro Gonzalez'], teamId: 'barcelona' },
  { name: 'Gavi', aliases: ['Gavi', 'Gavilar'], teamId: 'barcelona' },
  { name: 'Frenkie de Jong', aliases: ['Frenkie de Jong', 'de Jong', 'FDJ'], teamId: 'barcelona' },
  { name: 'Marc-Andre ter Stegen', aliases: ['Marc-Andre ter Stegen', 'ter Stegen', 'MTS'], teamId: 'barcelona' },
  { name: 'Ronald Araujo', aliases: ['Ronald Araujo', 'Araujo'], teamId: 'barcelona' },
  { name: 'Alejandro Balde', aliases: ['Alejandro Balde', 'Balde'], teamId: 'barcelona' },
  { name: 'Ferran Torres', aliases: ['Ferran Torres', 'Ferran'], teamId: 'barcelona' },
  { name: 'Raphinha', aliases: ['Raphinha'], teamId: 'barcelona' },
  { name: 'Lamine Yamal', aliases: ['Lamine Yamal', 'Yamal', 'Lamine'], teamId: 'barcelona' },

  // ── La Liga: Atletico Madrid ───────────────────────────────────────────────
  { name: 'Antoine Griezmann', aliases: ['Antoine Griezmann', 'Griezmann', 'Grizou'], teamId: 'atletico' },
  { name: 'Alvaro Morata', aliases: ['Alvaro Morata', 'Morata'], teamId: 'atletico' },
  { name: 'Jan Oblak', aliases: ['Jan Oblak', 'Oblak'], teamId: 'atletico' },
  { name: 'Koke', aliases: ['Koke'], teamId: 'atletico' },
  { name: 'Rodrigo De Paul', aliases: ['Rodrigo De Paul', 'De Paul'], teamId: 'atletico' },
  { name: 'Mario Hermoso', aliases: ['Mario Hermoso', 'Hermoso'], teamId: 'atletico' },
  { name: 'Marcos Llorente', aliases: ['Marcos Llorente', 'Llorente'], teamId: 'atletico' },
  { name: 'Samuel Lino', aliases: ['Samuel Lino', 'Lino'], teamId: 'atletico' },

  // ── La Liga: Villarreal ────────────────────────────────────────────────────
  { name: 'Gerard Moreno', aliases: ['Gerard Moreno', 'Moreno'], teamId: 'villarreal' },
  { name: 'Dani Parejo', aliases: ['Dani Parejo', 'Parejo'], teamId: 'villarreal' },
  { name: 'Arnaut Danjuma', aliases: ['Arnaut Danjuma', 'Danjuma'], teamId: 'villarreal' },

  // ── La Liga: Real Betis ────────────────────────────────────────────────────
  { name: 'Nabil Fekir', aliases: ['Nabil Fekir', 'Fekir'], teamId: 'real-betis' },
  { name: 'Isco', aliases: ['Isco'], teamId: 'real-betis' },
  { name: 'Rui Silva', aliases: ['Rui Silva'], teamId: 'real-betis' },
  { name: 'Ayoze Perez', aliases: ['Ayoze Perez', 'Ayoze'], teamId: 'real-betis' },

  // ── Serie A: Inter Milan ───────────────────────────────────────────────────
  { name: 'Lautaro Martinez', aliases: ['Lautaro Martinez', 'Lautaro', 'El Toro'], teamId: 'inter' },
  { name: 'Marcus Thuram', aliases: ['Marcus Thuram', 'Thuram'], teamId: 'inter' },
  { name: 'Nicolo Barella', aliases: ['Nicolo Barella', 'Barella'], teamId: 'inter' },
  { name: 'Hakan Calhanoglu', aliases: ['Hakan Calhanoglu', 'Calhanoglu', 'Hakan'], teamId: 'inter' },
  { name: 'Francesco Acerbi', aliases: ['Francesco Acerbi', 'Acerbi'], teamId: 'inter' },
  { name: 'Yann Sommer', aliases: ['Yann Sommer', 'Sommer'], teamId: 'inter' },
  { name: 'Alessandro Bastoni', aliases: ['Alessandro Bastoni', 'Bastoni'], teamId: 'inter' },
  { name: 'Henrikh Mkhitaryan', aliases: ['Henrikh Mkhitaryan', 'Mkhitaryan', 'Micki'], teamId: 'inter' },

  // ── Serie A: AC Milan ──────────────────────────────────────────────────────
  { name: 'Olivier Giroud', aliases: ['Olivier Giroud', 'Giroud'], teamId: 'ac-milan' },
  { name: 'Rafael Leao', aliases: ['Rafael Leao', 'Leao', 'Rafa Leao'], teamId: 'ac-milan' },
  { name: 'Mike Maignan', aliases: ['Mike Maignan', 'Maignan', 'Magic Mike'], teamId: 'ac-milan' },
  { name: 'Theo Hernandez', aliases: ['Theo Hernandez', 'Theo'], teamId: 'ac-milan' },
  { name: 'Tijjani Reijnders', aliases: ['Tijjani Reijnders', 'Reijnders'], teamId: 'ac-milan' },
  { name: 'Christian Pulisic', aliases: ['Christian Pulisic', 'Pulisic', 'Captain America'], teamId: 'ac-milan' },
  { name: 'Fikayo Tomori', aliases: ['Fikayo Tomori', 'Tomori'], teamId: 'ac-milan' },
  { name: 'Sandro Tonali', aliases: ['Sandro Tonali', 'Tonali'], teamId: 'ac-milan' },

  // ── Serie A: Juventus ──────────────────────────────────────────────────────
  { name: 'Dušan Vlahovic', aliases: ['Dusan Vlahovic', 'Vlahovic', 'DV9'], teamId: 'juventus' },
  { name: 'Federico Chiesa', aliases: ['Federico Chiesa', 'Chiesa'], teamId: 'juventus' },
  { name: 'Paul Pogba', aliases: ['Paul Pogba', 'Pogba', 'Polpo Paul'], teamId: 'juventus' },
  { name: 'Manuel Locatelli', aliases: ['Manuel Locatelli', 'Locatelli'], teamId: 'juventus' },
  { name: 'Wojciech Szczesny', aliases: ['Wojciech Szczesny', 'Szczesny'], teamId: 'juventus' },
  { name: 'Adrien Rabiot', aliases: ['Adrien Rabiot', 'Rabiot'], teamId: 'juventus' },
  { name: 'Gleison Bremer', aliases: ['Gleison Bremer', 'Bremer'], teamId: 'juventus' },

  // ── Serie A: Napoli ────────────────────────────────────────────────────────
  { name: 'Victor Osimhen', aliases: ['Victor Osimhen', 'Osimhen', 'OSIMHEN'], teamId: 'napoli' },
  { name: 'Khvicha Kvaratskhelia', aliases: ['Khvicha Kvaratskhelia', 'Kvaratskhelia', 'Kvara', 'Kvaradona'], teamId: 'napoli' },
  { name: 'Stanislav Lobotka', aliases: ['Stanislav Lobotka', 'Lobotka'], teamId: 'napoli' },
  { name: 'Piotr Zielinski', aliases: ['Piotr Zielinski', 'Zielinski'], teamId: 'napoli' },
  { name: 'Alex Meret', aliases: ['Alex Meret', 'Meret'], teamId: 'napoli' },
  { name: 'Giovanni Di Lorenzo', aliases: ['Giovanni Di Lorenzo', 'Di Lorenzo'], teamId: 'napoli' },

  // ── Serie A: Roma ──────────────────────────────────────────────────────────
  { name: 'Paulo Dybala', aliases: ['Paulo Dybala', 'Dybala', 'La Joya'], teamId: 'roma' },
  { name: 'Romelu Lukaku', aliases: ['Romelu Lukaku', 'Lukaku', 'Big Rom'], teamId: 'roma' },
  { name: 'Lorenzo Pellegrini', aliases: ['Lorenzo Pellegrini', 'Pellegrini'], teamId: 'roma' },
  { name: 'Leandro Paredes', aliases: ['Leandro Paredes', 'Paredes'], teamId: 'roma' },
  { name: 'Mile Svilar', aliases: ['Mile Svilar', 'Svilar'], teamId: 'roma' },

  // ── Serie A: Lazio ─────────────────────────────────────────────────────────
  { name: 'Ciro Immobile', aliases: ['Ciro Immobile', 'Immobile'], teamId: 'lazio' },
  { name: 'Felipe Anderson', aliases: ['Felipe Anderson', 'Anderson'], teamId: 'lazio' },
  { name: 'Ivan Provedel', aliases: ['Ivan Provedel', 'Provedel'], teamId: 'lazio' },
  { name: 'Sergej Milinkovic-Savic', aliases: ['Sergej Milinkovic-Savic', 'SMS', 'Milinkovic-Savic'], teamId: 'lazio' },

  // ── Serie A: Atalanta ──────────────────────────────────────────────────────
  { name: 'Ademola Lookman', aliases: ['Ademola Lookman', 'Lookman'], teamId: 'atalanta' },
  { name: 'Gianluca Scamacca', aliases: ['Gianluca Scamacca', 'Scamacca'], teamId: 'atalanta' },
  { name: 'Teun Koopmeiners', aliases: ['Teun Koopmeiners', 'Koopmeiners'], teamId: 'atalanta' },
  { name: 'Rasmus Hojlund', aliases: [], teamId: 'atalanta' }, // Hojlund previously at Atalanta
  { name: 'Juan Musso', aliases: ['Juan Musso', 'Musso'], teamId: 'atalanta' },
  { name: 'Merih Demiral', aliases: ['Merih Demiral', 'Demiral'], teamId: 'atalanta' },

  // ── Ligue 1: PSG ──────────────────────────────────────────────────────────
  { name: 'Ousmane Dembele', aliases: ['Ousmane Dembele', 'Dembele', 'Dembélé'], teamId: 'psg' },
  { name: 'Gianluigi Donnarumma', aliases: ['Gianluigi Donnarumma', 'Donnarumma', 'Gigio'], teamId: 'psg' },
  { name: 'Marquinhos', aliases: ['Marquinhos'], teamId: 'psg' },
  { name: 'Fabian Ruiz', aliases: ['Fabian Ruiz', 'Ruiz'], teamId: 'psg' },
  { name: 'Achraf Hakimi', aliases: ['Achraf Hakimi', 'Hakimi'], teamId: 'psg' },
  { name: 'Bradley Barcola', aliases: ['Bradley Barcola', 'Barcola'], teamId: 'psg' },
  { name: 'Marco Asensio', aliases: ['Marco Asensio', 'Asensio'], teamId: 'psg' },

  // ── Ligue 1: Marseille ─────────────────────────────────────────────────────
  { name: 'Pierre-Emerick Aubameyang', aliases: ['Pierre-Emerick Aubameyang', 'Aubameyang', 'Auba'], teamId: 'marseille' },
  { name: 'Iliman Ndiaye', aliases: ['Iliman Ndiaye', 'Ndiaye'], teamId: 'marseille' },
  { name: 'Pau Lopez', aliases: ['Pau Lopez'], teamId: 'marseille' },
  { name: 'Leonardo Balerdi', aliases: ['Leonardo Balerdi', 'Balerdi'], teamId: 'marseille' },

  // ── Ligue 1: Monaco ────────────────────────────────────────────────────────
  { name: 'Wissam Ben Yedder', aliases: ['Wissam Ben Yedder', 'Ben Yedder'], teamId: 'monaco' },
  { name: 'Breel Embolo', aliases: ['Breel Embolo', 'Embolo'], teamId: 'monaco' },
  { name: 'Aleksandr Golovin', aliases: ['Aleksandr Golovin', 'Golovin'], teamId: 'monaco' },
  { name: 'Youssouf Fofana', aliases: ['Youssouf Fofana', 'Fofana'], teamId: 'monaco' },

  // ── Ligue 1: Lyon ──────────────────────────────────────────────────────────
  { name: 'Alexandre Lacazette', aliases: ['Alexandre Lacazette', 'Lacazette', 'Laca'], teamId: 'lyon' },
  { name: 'Rayan Cherki', aliases: ['Rayan Cherki', 'Cherki'], teamId: 'lyon' },
  { name: 'Maxence Caqueret', aliases: ['Maxence Caqueret', 'Caqueret'], teamId: 'lyon' },

  // ── Ligue 1: Lille ─────────────────────────────────────────────────────────
  { name: 'Jonathan David', aliases: ['Jonathan David', 'David'], teamId: 'lille' },
  { name: 'Benjamin Andre', aliases: ['Benjamin Andre', 'Andre'], teamId: 'lille' },
  { name: 'Angel Gomes', aliases: ['Angel Gomes', 'Gomes'], teamId: 'lille' },
  { name: 'Leny Yoro', aliases: ['Leny Yoro', 'Yoro'], teamId: 'lille' },

  // ── Bundesliga: Bayern Munich ──────────────────────────────────────────────
  { name: 'Harry Kane', aliases: ['Harry Kane', 'Kane', 'The Hurricane'], teamId: 'bayern' },
  { name: 'Jamal Musiala', aliases: ['Jamal Musiala', 'Musiala', 'Bambi'], teamId: 'bayern' },
  { name: 'Leroy Sane', aliases: ['Leroy Sane', 'Sane'], teamId: 'bayern' },
  { name: 'Thomas Muller', aliases: ['Thomas Muller', 'Muller', 'Raumdeuter'], teamId: 'bayern' },
  { name: 'Manuel Neuer', aliases: ['Manuel Neuer', 'Neuer', 'The Wall'], teamId: 'bayern' },
  { name: 'Joshua Kimmich', aliases: ['Joshua Kimmich', 'Kimmich'], teamId: 'bayern' },
  { name: 'Leon Goretzka', aliases: ['Leon Goretzka', 'Goretzka'], teamId: 'bayern' },
  { name: 'Alphonso Davies', aliases: ['Alphonso Davies', 'Davies', 'Phonzie'], teamId: 'bayern' },

  // ── Bundesliga: Borussia Dortmund ──────────────────────────────────────────
  { name: 'Niclas Fullkrug', aliases: ['Niclas Fullkrug', 'Fullkrug', 'Torjager'], teamId: 'dortmund' },
  { name: 'Marco Reus', aliases: ['Marco Reus', 'Reus'], teamId: 'dortmund' },
  { name: 'Julian Brandt', aliases: ['Julian Brandt', 'Brandt'], teamId: 'dortmund' },
  { name: 'Gregor Kobel', aliases: ['Gregor Kobel', 'Kobel'], teamId: 'dortmund' },
  { name: 'Mats Hummels', aliases: ['Mats Hummels', 'Hummels'], teamId: 'dortmund' },
  { name: 'Felix Nmecha', aliases: ['Felix Nmecha', 'Nmecha'], teamId: 'dortmund' },
  { name: 'Karim Adeyemi', aliases: ['Karim Adeyemi', 'Adeyemi'], teamId: 'dortmund' },
  { name: 'Jamie Bynoe-Gittens', aliases: ['Jamie Bynoe-Gittens', 'Bynoe-Gittens', 'JBG'], teamId: 'dortmund' },

  // ── Bundesliga: Bayer Leverkusen ───────────────────────────────────────────
  { name: 'Granit Xhaka', aliases: ['Granit Xhaka', 'Xhaka'], teamId: 'leverkusen' },
  { name: 'Florian Wirtz', aliases: ['Florian Wirtz', 'Wirtz'], teamId: 'leverkusen' },
  { name: 'Victor Boniface', aliases: ['Victor Boniface', 'Boniface'], teamId: 'leverkusen' },
  { name: 'Alejandro Grimaldo', aliases: ['Alejandro Grimaldo', 'Grimaldo'], teamId: 'leverkusen' },
  { name: 'Lukas Hradecky', aliases: ['Lukas Hradecky', 'Hradecky'], teamId: 'leverkusen' },
  { name: 'Exequiel Palacios', aliases: ['Exequiel Palacios', 'Palacios'], teamId: 'leverkusen' },
  { name: 'Jonas Hofmann', aliases: ['Jonas Hofmann', 'Hofmann'], teamId: 'leverkusen' },
  { name: 'Granit Xhaka', aliases: [], teamId: 'leverkusen' },

  // ── Bundesliga: RB Leipzig ─────────────────────────────────────────────────
  { name: 'Timo Werner', aliases: ['Timo Werner', 'Werner'], teamId: 'rb-leipzig' },
  { name: 'Xavi Simons', aliases: ['Xavi Simons', 'Simons'], teamId: 'rb-leipzig' },
  { name: 'Dani Olmo', aliases: ['Dani Olmo', 'Olmo'], teamId: 'rb-leipzig' },
  { name: 'Peter Gulacsi', aliases: ['Peter Gulacsi', 'Gulacsi'], teamId: 'rb-leipzig' },
  { name: 'Benjamin Sesko', aliases: ['Benjamin Sesko', 'Sesko'], teamId: 'rb-leipzig' },
  { name: 'Willi Orban', aliases: ['Willi Orban', 'Orban'], teamId: 'rb-leipzig' },

  // ── Bundesliga: Eintracht Frankfurt ───────────────────────────────────────
  { name: 'Omar Marmoush', aliases: ['Omar Marmoush', 'Marmoush'], teamId: 'frankfurt' },
  { name: 'Hugo Larsson', aliases: ['Hugo Larsson', 'Larsson'], teamId: 'frankfurt' },
  { name: 'Ansgar Knauff', aliases: ['Ansgar Knauff', 'Knauff'], teamId: 'frankfurt' },
  { name: 'Kevin Trapp', aliases: ['Kevin Trapp', 'Trapp'], teamId: 'frankfurt' },
  { name: 'Evan N\'Dicka', aliases: ['Evan N\'Dicka', 'N\'Dicka'], teamId: 'frankfurt' },
];

export function detectTeamIds(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const p of PLAYERS) {
    for (const alias of [p.name, ...p.aliases]) {
      if (alias && lower.includes(alias.toLowerCase())) {
        found.add(p.teamId);
        break;
      }
    }
  }
  return Array.from(found);
}
