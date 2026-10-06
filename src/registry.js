// Who answers at each of the 38 places. Every place has one contact, who
// greets the player at the place's interaction point (its door, counter or
// gate in town-layout.js) and can send or receive deliveries.
// Names are placeholders until the full NPC list is written; {name} is the
// player's chosen name.
export const CONTACTS = {
  1: { name: 'Mak', role: 'Your mother', hello: 'Dah balik, {name}? Basuh tangan dulu before you touch the kuih.' },
  2: { name: 'Nenek', role: 'Your grandmother', hello: 'Cucu Nenek! Come, sit. Atuk is napping on the anjung.' },
  3: { name: 'Pak Mail', role: 'Kampung farmer', hello: 'Hah, budak bertuah. Mind my chilli seedlings.' },
  4: { name: 'Mak Cik Salmah', role: 'Neighbour who sells kuih', hello: 'Eh, {name}. Mak Cik just finished frying cucur.' },
  5: { name: 'Kak Rohani', role: 'Neighbour', hello: 'Looking for Nur again? She went past just now.' },
  6: { name: 'Abang Kamal', role: 'Lorry driver', hello: 'Rest day today. The lorry needs it more than me.' },
  7: { name: 'Mak Long Timah', role: 'Neighbour', hello: 'Jangan main jauh-jauh, {name}. Maghrib nanti balik.' },
  8: { name: 'Pak Ngah Daud', role: 'Looks after the old house', hello: 'This house is older than your Atuk. I just keep it swept.' },
  9: { name: 'Tok Din', role: 'Orchard keeper', hello: 'The rambutan are nearly ready. Nearly.' },
  10: { name: 'Pak Long Ismail', role: 'River fisherman', hello: 'Shh. The ikan keli are shy today.' },
  11: { name: 'Cik Aminah', role: "Your friend's mother", hello: 'Assalamualaikum, {name}. Masuklah, have some air sirap.' },
  12: { name: 'Kak Lina', role: 'Neighbour', hello: 'Hai {name}! Tell your Mak I have her tupperware.' },
  13: { name: 'Pak Abu', role: 'Retired postman', hello: 'Thirty years of letters, this town. Every house, every name.' },
  14: { name: 'Auntie Mei Ling', role: 'Neighbour', hello: 'Ah, {name}. You grow taller every week!' },
  15: { name: 'Uncle Ravi', role: 'Neighbour', hello: 'Hello boy. The football is on tonight, you know.' },
  16: { name: 'Kak Yati', role: 'Neighbour', hello: 'Shh, the baby is sleeping. Cakap perlahan sikit.' },
  17: { name: 'Encik Faizal', role: 'Office clerk', hello: 'Saturday at last. No files, no phone calls.' },
  18: { name: 'Mak Cik Kiah', role: 'Neighbour', hello: 'Kenapa tercegat? Come in, come in.' },
  19: { name: 'Kak Ani', role: 'Runs the corner shop', hello: 'Kedai Sudut Mini, open till late. Nak apa, {name}?' },
  20: { name: 'Cikgu Farah', role: 'Tadika teacher', hello: 'The little ones are colouring today. Very quietly, for once.' },
  21: { name: 'Pak Mat', role: 'Warung owner', hello: 'Teh tarik? Or congkak?' },
  22: { name: 'Uncle Ah Seng', role: 'Sundry shop owner', hello: 'Mari, mari, {name}. What you want today?' },
  23: { name: 'Abang Muthu', role: 'Barber', hello: 'Short at the sides, like always?' },
  24: { name: 'Pak Hassan', role: 'Bicycle repairer', hello: 'Bring your basikal anytime. Tayar pancit I fix in five minutes.' },
  25: { name: 'Uncle Lim', role: 'Stationery and toy shop', hello: 'New cards came in this week. Look only, don’t bend!' },
  26: { name: 'Mak Cik Rosnah', role: 'Tailor', hello: 'Baju Raya orders already, and it is only Rejab.' },
  27: { name: 'Dr. Kumar', role: 'Town doctor', hello: 'Not sick, I hope? Good. Drink more water.' },
  28: { name: 'Mak Jah', role: 'Baker', hello: 'Roti just out of the oven. Smell that?' },
  29: { name: 'Cikgu Rahman', role: 'Headmaster', hello: 'Saturday, {name}, and still at school? Rajin.' },
  30: { name: 'Kak Senah', role: 'Canteen cook', hello: 'Nasi lemak finished already. Come early on Monday.' },
  31: { name: 'Tok Siak Harun', role: 'Mosque caretaker', hello: 'Assalamualaikum. The mosque is always open, {name}.' },
  32: { name: 'Tok Ketua Hamzah', role: 'Village head', hello: 'The balai raya is for everyone. Gotong-royong next Sunday.' },
  33: { name: 'Cik Azura', role: 'Librarian', hello: 'Shh. The new comics are on the bottom shelf.' },
  34: { name: 'Abang Hafiz', role: 'Sepak takraw captain', hello: 'We need one more player this evening. Interested?' },
  35: { name: 'Pak Karim', role: 'Bus driver', hello: 'Next bus to the bandar at four. Don’t be late.' },
  36: { name: 'Abang Rizal', role: 'Mechanic', hello: 'Careful, oil on the floor. What can I do for you?' },
  37: { name: 'Abang Azman', role: 'Petrol kiosk attendant', hello: 'Isi minyak? Oh, you walked. Ha ha.' },
  38: { name: 'Pak Usop', role: 'Night market organiser', hello: 'Saturday night the whole town comes here. Wait and see.' }
};
export const contactFor = id => CONTACTS[id];
export const hello = (id, name) => CONTACTS[id].hello.replaceAll('{name}', name);
// Every place can both send and receive deliveries.
export const canSend = id => Boolean(CONTACTS[id]);
export const canReceive = id => Boolean(CONTACTS[id]);
