#!/usr/bin/env python3
"""
Create EPUB for "Cellini vs the Ninja Turtles: The Golden Brother Returns"
A children's book for ages 5 and up
"""

from ebooklib import epub
from PIL import Image, ImageDraw, ImageFont
import os

# Book directory
BOOK_DIR = os.path.dirname(os.path.abspath(__file__))

def create_placeholder_cover():
    """Create a placeholder cover image with gold/turtle theme"""
    width, height = 1200, 1800
    img = Image.new('RGB', (width, height), '#1a1a2e')
    draw = ImageDraw.Draw(img)

    # Create sewer tunnel background effect
    for i in range(0, height, 40):
        shade = int(20 + (i / height) * 30)
        draw.rectangle([0, i, width, i + 40], fill=(shade, shade + 5, shade + 10))

    # Draw brick pattern
    brick_color = (60, 45, 35)
    for y in range(0, height, 30):
        offset = 0 if (y // 30) % 2 == 0 else 40
        for x in range(-40 + offset, width + 40, 80):
            draw.rectangle([x, y, x + 78, y + 28], outline=brick_color, width=2)

    # Golden glow in center
    for r in range(300, 50, -10):
        alpha = int(255 * (1 - r / 300) * 0.3)
        gold = (255, 215, 0)
        draw.ellipse([width//2 - r, height//2 - r - 100, width//2 + r, height//2 + r - 100],
                     fill=(gold[0], gold[1], gold[2]))

    # Title banner
    draw.rectangle([50, 100, width - 50, 400], fill=(20, 20, 40))
    draw.rectangle([50, 100, width - 50, 400], outline=(255, 215, 0), width=4)

    # Title text (using default font since custom fonts may not be available)
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        author_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        author_font = ImageFont.load_default()

    # Title
    title = "CELLINI"
    draw.text((width//2, 180), title, fill=(255, 215, 0), font=title_font, anchor="mm")

    title2 = "vs THE NINJA TURTLES"
    draw.text((width//2, 270), title2, fill=(144, 238, 144), font=subtitle_font, anchor="mm")

    subtitle = "The Golden Brother Returns"
    draw.text((width//2, 340), subtitle, fill=(200, 200, 200), font=subtitle_font, anchor="mm")

    # Draw stylized turtle silhouette
    turtle_y = height // 2 + 50
    # Shell
    draw.ellipse([width//2 - 150, turtle_y - 100, width//2 + 150, turtle_y + 100],
                 fill=(180, 150, 50), outline=(255, 215, 0), width=3)
    # Head
    draw.ellipse([width//2 - 40, turtle_y - 160, width//2 + 40, turtle_y - 80],
                 fill=(120, 150, 80))
    # Mask (gold)
    draw.rectangle([width//2 - 50, turtle_y - 140, width//2 + 50, turtle_y - 110],
                   fill=(255, 215, 0))
    # Pizza cutters
    draw.ellipse([width//2 - 200, turtle_y - 50, width//2 - 120, turtle_y + 30],
                 fill=(200, 200, 200), outline=(150, 150, 150), width=2)
    draw.ellipse([width//2 + 120, turtle_y - 50, width//2 + 200, turtle_y + 30],
                 fill=(200, 200, 200), outline=(150, 150, 150), width=2)

    # Author at bottom
    draw.text((width//2, height - 150), "A Children's Book", fill=(180, 180, 180),
              font=author_font, anchor="mm")
    draw.text((width//2, height - 100), "For Ages 5 and Up", fill=(180, 180, 180),
              font=author_font, anchor="mm")

    cover_path = os.path.join(BOOK_DIR, 'cover.png')
    return cover_path


def create_illustration():
    """Create a mid-book illustration showing Cellini and Splinter"""
    width, height = 1200, 900
    img = Image.new('RGB', (width, height), '#1a1a1a')
    draw = ImageDraw.Draw(img)

    # Sewer background
    for i in range(0, height, 30):
        shade = int(25 + (i / height) * 20)
        draw.rectangle([0, i, width, i + 30], fill=(shade, shade + 3, shade + 8))

    # Brick walls on sides
    brick_color = (55, 40, 30)
    for y in range(0, height, 25):
        offset = 0 if (y // 25) % 2 == 0 else 35
        for x in range(-35 + offset, 200, 70):
            draw.rectangle([x, y, x + 68, y + 23], outline=brick_color, width=2)
        for x in range(width - 200 - 35 + offset, width + 35, 70):
            draw.rectangle([x, y, x + 68, y + 23], outline=brick_color, width=2)

    # Light beam from above
    draw.polygon([(width//2 - 100, 0), (width//2 + 100, 0),
                  (width//2 + 200, height), (width//2 - 200, height)],
                 fill=(40, 45, 50))

    # Splinter (left side) - simplified
    splinter_x = width // 3
    splinter_y = height // 2 + 100
    # Robe (red/maroon)
    draw.polygon([(splinter_x - 60, splinter_y - 80), (splinter_x + 60, splinter_y - 80),
                  (splinter_x + 80, splinter_y + 150), (splinter_x - 80, splinter_y + 150)],
                 fill=(139, 69, 19))
    # Head
    draw.ellipse([splinter_x - 35, splinter_y - 150, splinter_x + 35, splinter_y - 60],
                 fill=(160, 130, 100))
    # Ears
    draw.ellipse([splinter_x - 50, splinter_y - 170, splinter_x - 20, splinter_y - 120],
                 fill=(160, 130, 100))
    draw.ellipse([splinter_x + 20, splinter_y - 170, splinter_x + 50, splinter_y - 120],
                 fill=(160, 130, 100))
    # Staff
    draw.line([(splinter_x - 100, splinter_y - 100), (splinter_x - 70, splinter_y + 150)],
              fill=(139, 90, 43), width=8)

    # Cellini (right side)
    cellini_x = 2 * width // 3
    cellini_y = height // 2 + 80
    # Shell
    draw.ellipse([cellini_x - 80, cellini_y - 60, cellini_x + 80, cellini_y + 80],
                 fill=(180, 150, 50), outline=(255, 215, 0), width=3)
    # Head
    draw.ellipse([cellini_x - 30, cellini_y - 110, cellini_x + 30, cellini_y - 50],
                 fill=(120, 150, 80))
    # Gold mask
    draw.rectangle([cellini_x - 40, cellini_y - 95, cellini_x + 40, cellini_y - 70],
                   fill=(255, 215, 0))
    # Arms with pizza cutters
    draw.line([(cellini_x - 60, cellini_y - 20), (cellini_x - 120, cellini_y - 60)],
              fill=(120, 150, 80), width=15)
    draw.line([(cellini_x + 60, cellini_y - 20), (cellini_x + 120, cellini_y - 80)],
              fill=(120, 150, 80), width=15)
    # Pizza cutters
    draw.ellipse([cellini_x - 160, cellini_y - 100, cellini_x - 100, cellini_y - 40],
                 fill=(200, 200, 200), outline=(100, 100, 100), width=2)
    draw.ellipse([cellini_x + 100, cellini_y - 120, cellini_x + 160, cellini_y - 60],
                 fill=(200, 200, 200), outline=(100, 100, 100), width=2)

    # Caption
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        font = ImageFont.load_default()

    draw.rectangle([0, height - 60, width, height], fill=(20, 20, 30))
    draw.text((width//2, height - 30), "Cellini faces Master Splinter in the sewers",
              fill=(200, 200, 200), font=font, anchor="mm")

    illust_path = os.path.join(BOOK_DIR, 'illustration.png')
    return illust_path


# Book Content - All 10 Chapters
BOOK_CONTENT = {
    "title": "Cellini vs the Ninja Turtles",
    "subtitle": "The Golden Brother Returns",
    "author": "A Children's Story",
    "chapters": [
        {
            "title": "Chapter 1: A Stranger in the Sewers",
            "content": """
<p>Pizza night was the best night in the turtle lair.</p>

<p>Leonardo sat at the big table, carefully arranging napkins. Raphael spun his sai while waiting for the delivery. Donatello was explaining how pizza sauce got its red color. And Michelangelo? He was doing a little dance because pepperoni was his absolute favorite.</p>

<p>"Cowabunga!" Mikey shouted. "I can smell it coming through the pipes!"</p>

<p>But it wasn't pizza that was coming.</p>

<p>A strange sound echoed through the tunnels. Splash, splash, splash. Footsteps. Someone was walking through the sewer water. And they were getting closer.</p>

<p>Leonardo held up his hand. Everyone got quiet.</p>

<p>"Mikey," Leo whispered, "go check it out."</p>

<p>"Why me?" Mikey whispered back.</p>

<p>"Because you're the fastest."</p>

<p>Michelangelo grumbled but grabbed his nunchucks. He disappeared into the dark tunnel like a shadow.</p>

<p>The other three brothers waited. The splashing sounds had stopped. Everything was too quiet.</p>

<p>Then Mikey came running back so fast he almost tripped over his own feet.</p>

<p>"Guys! GUYS!" He was out of breath. "There are footprints out there. Wet footprints. And they look like... they look like turtle feet!"</p>

<p>Before anyone could answer, a figure stepped out of the shadows and into the entrance of their home.</p>

<p>He was a turtle. A turtle like them. But he wasn't wearing blue or red or purple or orange. He was wearing brilliant, shining gold. In each hand, he held a gleaming circular blade that looked like... a pizza cutter?</p>

<p>The stranger struck a fighting pose. A smirk spread across his face.</p>

<p>"Hello, brothers," he said. "Did you miss me?"</p>
"""
        },
        {
            "title": "Chapter 2: The Golden Brother",
            "content": """
<p>"Brothers?" Raphael stepped forward, his sai ready. "We don't have a brother who looks like a walking gold medal. Who are you?"</p>

<p>The golden turtle laughed. It wasn't a happy laugh. It was cold and sharp like his spinning pizza cutters.</p>

<p>"My name is Cellini," he said. "And I am your brother. Your fifth brother. The one you forgot about."</p>

<p>"That's impossible," said Donatello, pushing up his glasses. "There were only four of us in the ooze. I've studied the science. Four turtles, four mutations, four brothers."</p>

<p>"Wrong." Cellini's pizza cutters spun faster in his hands. They made a whirring sound that filled the lair. "There were five. Five baby turtles in that glowing green goo. And I was one of them."</p>

<p>Leonardo looked at his brothers. None of them remembered a fifth turtle. How could they? They had been babies.</p>

<p>"Even if that's true," Leo said calmly, "why are you here now? What do you want?"</p>

<p>Cellini's smirk faded. His eyes got hard.</p>

<p>"I want to see Splinter. The rat who raised you. The father who chose you." His voice was bitter like burnt toast. "The master who left me behind."</p>

<p>The brothers gasped. No one talked about Splinter like that!</p>

<p>But before they could respond, the door to Splinter's room creaked open.</p>

<p>The old rat walked out slowly. His cane tapped against the floor. His eyes were sad—sadder than the brothers had ever seen.</p>

<p>"Cellini," Splinter whispered. His voice was full of something the brothers couldn't name. "After all these years..."</p>

<p>The golden turtle's pizza cutters stopped spinning. For just one second, he didn't look angry. He looked like a lost child.</p>

<p>Then the smirk came back.</p>

<p>"Hello, old rat. Ready to answer for what you did?"</p>
"""
        },
        {
            "title": "Chapter 3: Splinter's Secret",
            "content": """
<p>The lair was so quiet you could hear a pin drop. Or in this case, a drip of sewer water.</p>

<p>Splinter lowered himself onto his meditation cushion. He looked older than the brothers remembered. Tired.</p>

<p>"Sit," Splinter said to everyone. "It is time you knew the truth."</p>

<p>The four brothers sat. Cellini stayed standing, but his pizza cutters hung at his sides.</p>

<p>"Many years ago," Splinter began, "on the night I found you all, something terrible happened. Something I have never spoken of."</p>

<p>The brothers leaned in.</p>

<p>"There was a great storm above ground. Rain poured into the sewers like a river. The water rose fast—so fast." Splinter's whiskers trembled. "I found five baby turtles, not four, glowing with the green ooze of mutation."</p>

<p>"I knew it!" Cellini shouted.</p>

<p>"Please," Splinter said, holding up a gentle paw. "Let me finish."</p>

<p>Cellini crossed his arms but stayed quiet.</p>

<p>"The flood waters were rising. I had to move quickly or we would all drown. I gathered the babies—but I could only carry four." Splinter's voice cracked. "My arms are not big, my children. I am just a small rat. Four was all I could hold."</p>

<p>"So you left me," Cellini said. It wasn't a question.</p>

<p>"I set you down for just one moment. Just one moment, to get a better grip. But the water—" Splinter's eyes were wet now. "The water swept you away before I could reach you. I searched for weeks. Months. I never stopped believing you were out there. But I never found you."</p>

<p>The four brothers looked at each other. They had never seen Splinter cry before.</p>

<p>Cellini's jaw was tight. His hands were shaking.</p>

<p>"You LEFT me!" he shouted. His pizza cutters started spinning again, wild and angry. "You left me alone in the dark! And now you're going to pay!"</p>

<p>He raised his weapons, ready to fight.</p>
"""
        },
        {
            "title": "Chapter 4: Cellini's Story",
            "content": """
<p>"Wait!" Leonardo jumped between Cellini and Splinter. "You heard his story. Now let us hear yours. Please."</p>

<p>Cellini hesitated. The pizza cutters slowed their spinning.</p>

<p>"Fine," he said. "You want to know what happened to me? I'll tell you."</p>

<p>He sat down on a old pipe, but kept his weapons in his hands.</p>

<p>"The water carried me far away. Miles and miles through the dark tunnels. I was just a baby. I didn't understand what was happening. I was scared and alone."</p>

<p>The brothers listened quietly. Even Raphael's face was soft.</p>

<p>"I would have died," Cellini continued, "but an old sewer rat found me. His name was Gustavo. He raised me. But he wasn't like Splinter."</p>

<p>"What do you mean?" asked Donatello.</p>

<p>"Gustavo was mean. He didn't teach me ninja moves or cook me dinner or tell me bedtime stories. He taught me to fight because the sewers are dangerous. He taught me to survive because no one else would help me."</p>

<p>Cellini's voice got quiet. "I grew up alone. No brothers. No family pizza nights. No video games or laughing or... or love."</p>

<p>Michelangelo's bottom lip wobbled. He reached into the pizza box behind him and pulled out a slice.</p>

<p>"Here," Mikey said, walking over to Cellini. "This is pepperoni. It's the best kind. You should try it."</p>

<p>Cellini looked at the pizza slice. For a second, something soft flickered in his eyes.</p>

<p>Then he slapped it away. The pizza flew across the room and splattered against the wall.</p>

<p>"I don't want your pity!" Cellini stood up. "I didn't come here for pizza. I came here for revenge!"</p>

<p>Mikey looked at the wasted pizza on the floor. A single pepperoni rolled away sadly.</p>
"""
        },
        {
            "title": "Chapter 5: The Challenge",
            "content": """
<p>Cellini pointed one of his pizza cutters directly at Splinter.</p>

<p>"I challenge you, old rat. You and me. A fight. Tomorrow at midnight, in the Grand Tunnel where the five tunnels meet."</p>

<p>Splinter stood slowly. He didn't look scared. He looked sad.</p>

<p>"And if you win?" Splinter asked.</p>

<p>"If I win, you leave the sewers forever. You lose your home, your students, everything. Just like I lost everything."</p>

<p>The four brothers shouted all at once:</p>

<p>"No way!"</p>

<p>"You can't do this!"</p>

<p>"We won't let you!"</p>

<p>"That's totally uncool, dude!"</p>

<p>But Splinter raised his paw, and his sons fell silent.</p>

<p>"I accept," Splinter said.</p>

<p>"Father, no!" Leonardo stepped forward. "You don't have to do this. Let us fight him instead. We'll defend you!"</p>

<p>Splinter shook his head. "This is my burden, Leonardo. My choice, all those years ago, caused this pain. I must face it myself."</p>

<p>Raphael's face turned as red as his mask. "But Splinter, you're... you're..."</p>

<p>"Old?" Splinter smiled a tiny smile. "Yes. But old does not mean helpless. I was a ninja once, remember."</p>

<p>Cellini nodded sharply. "Tomorrow. Midnight. Be there." He turned to leave, but paused at the entrance.</p>

<p>"And brothers?" He looked back at Leonardo, Raphael, Donatello, and Michelangelo. "Don't try to interfere. This is between me and the rat."</p>

<p>Then he disappeared into the dark tunnels, his golden mask glinting one last time before the shadows swallowed him up.</p>
"""
        },
        {
            "title": "Chapter 6: Brothers Talk",
            "content": """
<p>That night, Splinter went to his room to meditate. He asked not to be disturbed.</p>

<p>The four brothers sat in a circle in the living area. Nobody wanted pizza anymore. Even Michelangelo just poked at a cold slice.</p>

<p>"This is ridiculous," Raphael said, punching the couch cushion. "We should go find that gold-plated faker and teach him a lesson!"</p>

<p>"Violence isn't always the answer, Raph," said Donatello. "Think about it. Cellini grew up alone, thinking we abandoned him. He's angry, but his anger comes from being hurt."</p>

<p>"So what, we should feel sorry for him?" Raph crossed his arms.</p>

<p>"Yes," said Leonardo quietly. Everyone looked at him. "He's our brother. He's been alone his whole life while we had each other. Of course he's angry. Wouldn't you be?"</p>

<p>Raphael opened his mouth to argue, then closed it. He looked at his brothers—at the way Mikey always made him laugh, at the way Donnie always fixed his stuff, at the way Leo always had his back.</p>

<p>"Yeah," Raph admitted. "I guess I would be."</p>

<p>"So what do we do?" asked Mikey. "Maybe he likes video games? I could let him borrow my controller. The good one!"</p>

<p>Leonardo thought for a moment. "We need to try talking to him. Really talking. Before the fight tomorrow."</p>

<p>"He didn't seem like he wanted to talk," Donnie pointed out.</p>

<p>"I know," Leo said. "But we have to try. If there's any chance we can reach him—any chance we can help him see he's not alone anymore—we have to take it."</p>

<p>The brothers looked at each other. Then, one by one, they nodded.</p>

<p>"Okay," said Mikey. "But if we're going to talk about feelings, I'm bringing snacks. You can't talk about feelings on an empty stomach."</p>

<p>Despite everything, his brothers smiled.</p>
"""
        },
        {
            "title": "Chapter 7: Finding Cellini",
            "content": """
<p>The four brothers searched the tunnels for hours. They checked the old waterway. They looked in the abandoned pump station. They even searched the tunnel that always smelled like gym socks.</p>

<p>Finally, they heard it. WHRRR. WHRRR. The sound of spinning pizza cutters.</p>

<p>They found Cellini in a tunnel that their maps called "The Forgotten Way." He was practicing his moves, slicing through old pipes like they were made of butter.</p>

<p>His movements were fast. Really fast. Even Leonardo was impressed.</p>

<p>"Go away," Cellini said without turning around. "I know you're there. I could hear you stomping from a mile away."</p>

<p>"We just want to talk," Leo said, stepping forward with his hands up.</p>

<p>"There's nothing to talk about."</p>

<p>"Sure there is!" Mikey chimed in. "Like, where did you get those cool pizza cutters? Did you make them yourself? Do they actually cut pizza? Because that would be SO useful on pizza night—"</p>

<p>"ENOUGH!" Cellini spun around. His eyes were wet, but his face was angry. "You want to know where I got these?"</p>

<p>He held up the gleaming circular blades.</p>

<p>"I made them. From scraps I found in the garbage. Because that's where I lived. In the garbage. While you four had your cozy lair and your video games and your PIZZA NIGHTS!"</p>

<p>His voice echoed through the tunnel. Then, quieter: "You had everything I ever wanted. All I wanted was a family."</p>

<p>The brothers stood still. What could they say to that?</p>

<p>Donatello stepped forward slowly. "Cellini, we didn't know. If we had known you were out there, we would have looked for you."</p>

<p>"But you didn't."</p>

<p>"No. We didn't. And that's not fair. But fighting Splinter won't change the past. It'll just make everyone more sad."</p>

<p>For one moment, Cellini's angry face wavered. He looked like he might actually listen.</p>

<p>Then he turned away. "The fight happens at midnight. Nothing changes that."</p>

<p>He walked deeper into the dark tunnel, leaving the brothers behind.</p>
"""
        },
        {
            "title": "Chapter 8: Midnight Battle",
            "content": """
<p>The Grand Tunnel was huge. Five tunnel openings met in the center like the spokes of a wheel. Dripping water made little echoes all around.</p>

<p>Splinter stood in the center, calm as a still pond. His walking cane was actually his fighting staff—the brothers knew this now.</p>

<p>Cellini appeared from the shadows. His golden mask caught the dim light from above. His pizza cutters gleamed.</p>

<p>The four brothers stood at the edge of the chamber. Leo had made them promise not to interfere. It was the hardest promise they'd ever made.</p>

<p>"Are you ready, old rat?" Cellini asked.</p>

<p>"I am ready, my son."</p>

<p>"DON'T call me that!" Cellini charged.</p>

<p>His pizza cutters were a golden blur. They sliced through the air with a WHRRR sound. But Splinter moved like water. Every attack, he blocked. Every thrust, he dodged.</p>

<p>"I am sorry, my son," Splinter said, blocking another strike.</p>

<p>Cellini attacked harder. His moves were powerful and fast. But Splinter wasn't trying to hurt him. Splinter was only defending.</p>

<p>"I am sorry I could not carry you," Splinter said.</p>

<p>CLANG! The pizza cutter hit the staff.</p>

<p>"I am sorry you grew up alone."</p>

<p>CLANG! Another strike blocked.</p>

<p>"I am sorry you were hurt."</p>

<p>CLANG! CLANG! CLANG!</p>

<p>"STOP APOLOGIZING!" Cellini screamed. "FIGHT BACK! Hurt me like I've been hurt! Be the villain I need you to be!"</p>

<p>But Splinter just kept blocking. Just kept apologizing. Just kept looking at Cellini with those sad, loving eyes.</p>

<p>"FIGHT ME!" Cellini's voice cracked. It wasn't an angry shout anymore. It was almost a sob.</p>
"""
        },
        {
            "title": "Chapter 9: The Truth Comes Out",
            "content": """
<p>Cellini's pizza cutters fell from his hands.</p>

<p>They clattered against the stone floor and spun to a stop. The whirring sound faded to silence.</p>

<p>The golden turtle dropped to his knees. His whole body was shaking.</p>

<p>"Why won't you fight back?" he whispered. "Why won't you be mean to me? It would be so much easier if you were mean."</p>

<p>Splinter knelt down in front of him. Slowly, carefully, like approaching a frightened animal.</p>

<p>"Because I could never hurt you, Cellini. You are my son. I have carried the sadness of losing you for my entire life."</p>

<p>"You... you did?"</p>

<p>"Every night, I wondered where you were. If you were safe. If you were afraid." Splinter's eyes were wet. "I never stopped hoping I would see you again."</p>

<p>All of Cellini's anger seemed to melt away. What was left behind was something smaller, softer. Sadder.</p>

<p>"I didn't really want revenge," Cellini said, his voice small. "I just wanted... I wanted to matter. I wanted someone to have looked for me. I wanted to know I was worth searching for."</p>

<p>"You were, my son. You always were."</p>

<p>Splinter opened his arms, and Cellini fell into them. The golden turtle cried like he had been holding in tears for his entire life. Because he had been.</p>

<p>The four brothers looked at each other. Then, without saying a word, they walked forward.</p>

<p>Leonardo put his hand on Cellini's shoulder. Then Raphael. Then Donatello. Then Michelangelo.</p>

<p>"You're our brother," Leo said softly. "You always were. We just didn't know it."</p>

<p>"Yeah, dude," said Mikey. "And brothers stick together. Forever."</p>

<p>In that tunnel, surrounded by his family for the first time in his life, Cellini smiled a real smile.</p>

<p>It felt strange on his face. But also really, really good.</p>
"""
        },
        {
            "title": "Chapter 10: Five Turtles",
            "content": """
<p>The next evening, something special happened in the turtle lair.</p>

<p>Five chairs sat around the big table instead of four. Five plates. Five glasses. Five napkins.</p>

<p>And five turtles.</p>

<p>"PIZZA NIGHT!" Michelangelo shouted, carrying in the biggest pizza the brothers had ever ordered. "With extra pepperoni, because we're celebrating!"</p>

<p>Cellini looked at the pizza, then at his brothers, then at Splinter. He still felt a little strange. Like he didn't quite fit. But his brothers kept making room for him, and that helped.</p>

<p>"Hey, Cellini," said Donatello, "why did you choose pizza cutters as weapons? I've been curious about the design."</p>

<p>Cellini looked down at his weapons, sitting on the table next to his plate.</p>

<p>"Because..." He took a deep breath. "Because I always wished I could share pizza with a family. I used to watch you guys through the pipes. Saw you laughing, eating pizza, being together. I wanted that so bad."</p>

<p>The lair got quiet. Then Raphael—tough, grumpy Raphael—slid the pizza box toward Cellini.</p>

<p>"First slice goes to you, golden boy. House rules."</p>

<p>Cellini looked at the pizza. Then at his brothers. Then he grabbed the biggest slice he could find.</p>

<p>It was the most delicious thing he had ever tasted. Not because of the cheese or the pepperoni or the perfect crust.</p>

<p>Because he wasn't eating alone.</p>

<p>Splinter watched his five sons laughing and eating and being brothers. His heart felt fuller than it had in years.</p>

<p>"Cellini," Splinter said gently, "there is one more thing I wish to teach you. The greatest weapon a ninja can have."</p>

<p>"What's that?"</p>

<p>"Forgiveness. Forgiving others for their mistakes. And forgiving yourself for your anger."</p>

<p>Cellini thought about this. Then he nodded. "I think I'm ready to learn that."</p>

<p>Michelangelo jumped up and threw an arm around his new brother. "Dude! You know what this means? We can do a FIVE-TURTLE NINJA POSE now!"</p>

<p>The five brothers stood together—blue, red, purple, orange, and gold. They struck their coolest ninja poses.</p>

<p>Cellini wasn't smirking anymore. He was grinning.</p>

<p>"Cowabunga, bro," said Mikey, handing Cellini another slice—the biggest one left. "Welcome home."</p>

<p>And finally, after all those years alone in the dark, Cellini was exactly where he belonged.</p>

<p class="the-end">~ The End ~</p>
"""
        }
    ]
}


def create_epub():
    """Create the EPUB file with all content and images"""

    # Create images
    print("Creating cover image...")
    cover_path = create_placeholder_cover()

    print("Creating illustration...")
    illustration_path = create_illustration()

    # Create EPUB
    book = epub.EpubBook()

    # Set metadata
    book.set_identifier('cellini-vs-ninja-turtles-001')
    book.set_title('Cellini vs the Ninja Turtles: The Golden Brother Returns')
    book.set_language('en')
    book.add_author('A Children\'s Story')

    # Add cover image
    with open(cover_path, 'rb') as f:
        cover_content = f.read()
    book.set_cover('cover.png', cover_content)

    # Add illustration image
    with open(illustration_path, 'rb') as f:
        illust_content = f.read()
    illust_image = epub.EpubImage()
    illust_image.file_name = 'images/illustration.png'
    illust_image.content = illust_content
    book.add_item(illust_image)

    # Add CSS
    style = '''
    @namespace epub "http://www.idpf.org/2007/ops";

    body {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 1.1em;
        line-height: 1.6;
        margin: 5%;
    }

    h1 {
        text-align: center;
        font-size: 1.8em;
        margin-top: 2em;
        margin-bottom: 1em;
        color: #2c5530;
        border-bottom: 2px solid #d4a843;
        padding-bottom: 0.5em;
    }

    h2 {
        text-align: center;
        font-size: 1.4em;
        color: #d4a843;
        margin-bottom: 0.5em;
    }

    p {
        margin-bottom: 0.8em;
        text-indent: 0;
    }

    .title-page {
        text-align: center;
        margin-top: 30%;
    }

    .title-page h1 {
        font-size: 2.5em;
        color: #d4a843;
        border: none;
        margin-bottom: 0.3em;
    }

    .title-page h2 {
        font-size: 1.5em;
        color: #2c5530;
        margin-bottom: 1em;
    }

    .title-page p {
        font-style: italic;
        color: #666;
    }

    .illustration {
        text-align: center;
        margin: 2em 0;
        page-break-before: always;
    }

    .illustration img {
        max-width: 100%;
        height: auto;
    }

    .illustration p {
        font-style: italic;
        color: #666;
        margin-top: 0.5em;
    }

    .the-end {
        text-align: center;
        font-size: 1.3em;
        font-style: italic;
        margin-top: 2em;
        color: #d4a843;
    }

    .dedication {
        text-align: center;
        font-style: italic;
        margin: 20% 10%;
    }
    '''

    css = epub.EpubItem(
        uid="style",
        file_name="style/style.css",
        media_type="text/css",
        content=style
    )
    book.add_item(css)

    # Create title page
    title_page = epub.EpubHtml(title='Title Page', file_name='title.xhtml', lang='en')
    title_page.content = f'''
    <html>
    <head><link rel="stylesheet" href="style/style.css" /></head>
    <body>
    <div class="title-page">
        <h1>CELLINI<br/>vs<br/>THE NINJA TURTLES</h1>
        <h2>The Golden Brother Returns</h2>
        <p>A Children's Book for Ages 5 and Up</p>
    </div>
    </body>
    </html>
    '''
    title_page.add_item(css)
    book.add_item(title_page)

    # Create dedication page
    dedication = epub.EpubHtml(title='Dedication', file_name='dedication.xhtml', lang='en')
    dedication.content = '''
    <html>
    <head><link rel="stylesheet" href="style/style.css" /></head>
    <body>
    <div class="dedication">
        <p>For all the kids who ever felt left out.</p>
        <p>You matter. You belong. You are loved.</p>
    </div>
    </body>
    </html>
    '''
    dedication.add_item(css)
    book.add_item(dedication)

    # Create chapters
    chapters = []
    for i, chapter_data in enumerate(BOOK_CONTENT['chapters']):
        chapter = epub.EpubHtml(
            title=chapter_data['title'],
            file_name=f'chapter_{i+1:02d}.xhtml',
            lang='en'
        )

        content = f'''
        <html>
        <head><link rel="stylesheet" href="style/style.css" /></head>
        <body>
        <h1>{chapter_data['title']}</h1>
        {chapter_data['content']}
        </body>
        </html>
        '''

        # Add illustration after chapter 5 (mid-book)
        if i == 4:
            content = f'''
        <html>
        <head><link rel="stylesheet" href="style/style.css" /></head>
        <body>
        <h1>{chapter_data['title']}</h1>
        {chapter_data['content']}
        <div class="illustration">
            <img src="images/illustration.png" alt="Cellini faces Master Splinter" />
            <p>Cellini and Splinter face each other in the sewers</p>
        </div>
        </body>
        </html>
        '''

        chapter.content = content
        chapter.add_item(css)
        book.add_item(chapter)
        chapters.append(chapter)

    # Define table of contents
    book.toc = (
        epub.Link('title.xhtml', 'Title Page', 'title'),
        epub.Link('dedication.xhtml', 'Dedication', 'dedication'),
        (epub.Section('Chapters'),
         chapters)
    )

    # Add navigation files
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    # Define spine
    book.spine = ['nav', title_page, dedication] + chapters

    # Write EPUB file
    epub_path = os.path.join(BOOK_DIR, 'cellini-vs-ninja-turtles.epub')
    epub.write_epub(epub_path, book, {})

    print(f"EPUB created successfully: {epub_path}")
    return epub_path


if __name__ == '__main__':
    create_epub()
