#!/usr/bin/env python3
"""
Populate idioms database with comprehensive data from CSV
This script processes the provided CSV data and creates a proper JSON file for IdiomFlow
"""

import json
import uuid
import re

# The comprehensive CSV data from the user
csv_data = """Idiom,Meaning,Example,Related Idiom,Difficulty Level,Category,Origin
Break the ice,To initiate conversation in a social setting,She told a joke to break the ice at the meeting.,Start the ball rolling,Easy,Popular, From old sailing ships breaking ice to create a path
Bite the bullet,To endure a painful situation with courage,He had to bite the bullet and admit his mistake.,Face the music,Medium,Popular,From battlefield surgery without anesthesia (biting a bullet to endure pain).
Hit the sack,To go to bed or sleep,"I'm really tired, I'm going to hit the sack.",Catch some Z's,Easy,Popular,Refers to sleeping on a sack filled with hay in olden times.
Let the cat out of the bag,To reveal a secret accidentally,He let the cat out of the bag about her surprise party.,Spill the beans,Medium,Popular, From medieval markets—dishonest sellers would replace a pig with a cat in a bag.
Once in a blue moon,Something that happens very rarely,I eat fast food only once in a blue moon.,Few and far between,Easy,Popular,Refers to rare second full moons in a calendar month.
Under the weather,Feeling sick or unwell,"I'm not coming today, I feel under the weather.",Off-color,Easy,Popular,Originates from sailors feeling ill during storms.
The ball is in your court,It's your decision now,"I've done my part, now the ball is in your court.",Your move,Easy,Popular,From tennis — it's your turn to respond.
On the same page,In agreement or understanding,We're finally on the same page about the project.,See eye to eye,Easy,Popular,Refers to reading the same part of a script or book.
Kill two birds with one stone,To solve two problems at once,I killed two birds with one stone by shopping while waiting for him.,Double benefit,Medium,Popular,From an old proverb about efficiency.
Cry over spilled milk,Worrying about something that cannot be changed,There's no use crying over spilled milk.,What's done is done,Easy,Popular,"From old European proverbs, warning not to be upset over small losses."
A blessing in disguise,Something that seems bad but turns out good,Losing that job was a blessing in disguise.,Silver lining,Easy,Popular,From 18th-century proverbs.
The last straw,The final problem in a series of issues,Her rude comment was the last straw.,The breaking point,Medium,Popular,Old idiom from camel-loading tales.
Cost an arm and a leg,Very expensive,That car cost me an arm and a leg!,Break the bank,Easy,Popular,Possibly WWII origin (soldiers' injuries).
Hit the nail on the head,Describe something accurately or do something exactly right,You hit the nail on the head with your analysis.,Spot on,Easy,Popular,Carpentry-related phrase.
Burn the midnight oil,Work late into the night,She burned the midnight oil to finish the report.,Pull an all-nighter,Medium,Popular,From oil lamps used before electricity.
Jump on the bandwagon,Join a popular trend or activity,Everyone's jumping on the fitness bandwagon.,Follow the crowd,Medium,Popular,Originated in U.S. political rallies.
Throw in the towel,Give up or quit,He threw in the towel after trying for years.,Give up the ghost,Easy,Popular,From boxing (literally throwing towel to quit).
Sit on the fence,Avoid taking sides in a dispute,She sat on the fence during the debate.,Be indecisive,Medium,Popular,Political metaphor from 1800s.
Barking up the wrong tree,Pursuing a false lead or mistaken belief,"If you think I did it, you're barking up the wrong tree.",Miss the mark,Medium,Popular,From hunting dogs barking at empty trees.
Kick the bucket,To die,He kicked the bucket at age 90.,Pass away,Medium,Popular,Possibly from hanging or slaughter practices.
Piece of cake,Something very easy to do,That test was a piece of cake.,Walk in the park,Easy,Popular,20th-century American slang.
A dime a dozen,Very common and of little value,Cheap plastic toys are a dime a dozen.,Common as dirt,Medium,Popular,U.S. 1800s (cheap goods).
Pull someone's leg,Joke or tease someone playfully,Don't worry — I'm just pulling your leg.,Wind someone up,Easy,Popular,Possibly old thieves' slang.
Back to the drawing board,Start again after a failure, The plan didn't work — back to the drawing board.,Try again,Medium,Popular,WWII engineering jargon.
Break a leg,Wish someone good luck (especially before a performance),Break a leg before your audition!,Best of luck,Easy,Popular,Theater superstition (opposite to avoid jinx).
Beat around the bush,Avoid saying something directly,Stop beating around the bush and tell me the truth.,Avoid the point,Medium,Popular,Hunting metaphor (flushing birds).
Cold Feet, Nervousness before a big decision or event,She got cold feet before the wedding.,Second thoughts,Medium,Popular, Possibly from military desertions.
In hot water,In trouble,He found himself in hot water after missing the deadline.,On the spot,Medium,Popular,From ancient punishments or risky situations.
Spill the beans, Reveal secret information,He spilled the beans about the merger.,Let the cat out of the bag,Easy,Popular,Possibly from voting systems in Ancient Greece.
Hit the road, To leave or begin a journey,We need to hit the road early tomorrow.,Get going,Easy,Popular,American travel slang.
Go the extra mile,Do more than what is expected,She always goes the extra mile for her customers.,Above and beyond,Easy,Popular,Biblical origin (Roman law).
Cut corners,Do something cheaply or carelessly,They cut corners when building the house.,Take shortcuts,Medium,Popular,From racing or construction.
Ace a test,To achieve a perfect or very high score on a test or exam,She studied for weeks and managed to ace her final exam.,Score perfectly,Easy,Education,"From the ace card, representing excellence"
Hit the books,To study hard,"I have a big exam tomorrow, so I need to hit the books tonight.",Study diligently,Easy,Education,From literally opening and studying books
Learn by heart,To memorize something perfectly,Students were required to learn the poem by heart for the recitation.,Memorize,Easy,Education,From knowing something so well it's ingrained in one's memory
Pass with flying colors,"To succeed easily and exceptionally well (in an exam, project, etc.)",She studied diligently and passed her final exam with flying colors.,Excel,Easy,Education,From flags being raised to show success
Pull an all-nighter,To stay up all night studying or working on a project,I had to pull an all-nighter to finish my research paper before the deadline.,Study all night,Easy,Education,From staying up for an entire night
Teacher's pet,A student who is favored by the teacher,"He always sat in the front row and answered every question, earning him the title of teacher's pet.",Favorite student,Easy,Education,From a student receiving preferential treatment from a teacher
Food for thought,Something that makes one think seriously; interesting information to consider,The professor's lecture on artificial intelligence gave us a lot of food for thought.,Something to consider,Easy,Education,From providing mental nourishment
Get a head start,To begin something before others; to gain an advantage by starting early,She got a head start on her research project over the summer.,Start early,Easy,Education,From beginning before others in a race
Three R's,"Refers to the basic skills of reading, writing, and arithmetic (traditionally taught in elementary school)",Modern education emphasizes more than just the three R's.,Basic skills,Easy,Education,"Abbreviation for Reading, 'Riting, 'Rithmetic"
A quick study,Someone who learns new things quickly and easily,The new intern is a quick study; she picked up all the procedures in just a few days.,Fast learner,Easy,Education,Describes someone who learns rapidly
Every cloud has a silver lining,Every difficult or unpleasant situation has some hidden advantage or good aspect.,"Losing that job was tough, but it led me to a better opportunity, proving every cloud has a silver lining.",Hope in adversity,Medium,General,From the appearance of clouds with the sun behind them
Raining cats and dogs,Raining very heavily.,I can't go out now; it's raining cats and dogs!,Pouring,Easy,General,"Unclear origin, possibly from old Norse mythology or slang"
Not rocket science,Not difficult to understand or do.,Learning to use this software is not rocket science; anyone can do it.,Simple,Easy,General,Rocket science is considered a very complex field
Like two peas in a pod,"Very similar in appearance, behavior, or interests.",My brother and I are like two peas in a pod; we enjoy all the same hobbies.,Identical,Easy,General,From the appearance of peas in a single pod
Blink of an eye,A very short period of time; almost instantly.,The magician made the card disappear in the blink of an eye.,Instantly,Easy,General,From the quick movement of an eyelid
The cat's pajamas,"Excellent; superb; wonderful (an older, somewhat humorous idiom).",Her new dress is absolutely the cat's pajamas!,Excellent,Medium,General,"From early 20th-century American slang, indicating something fashionable and desirable"
All thumbs,Clumsy or awkward with one's hands.,I'm all thumbs when it comes to needlework; I can never thread the needle.,Clumsy,Easy,General,"From the idea of having only thumbs, which are not dexterous for fine work"
A baker's dozen,Thirteen.,"I ordered a dozen donuts, but they gave me a baker's dozen.",Thirteen,Easy,General,Bakers historically added an extra item to a dozen to avoid being accused of shortchanging customers
Blind as a bat,Having very poor eyesight.,"Without my glasses, I'm as blind as a bat.",Poor vision,Easy,General,Bats are commonly perceived as having poor vision (though they use echolocation)
Bite your tongue,"To stop yourself from saying something that you want to say, because it would be rude or inappropriate.",I had to bite my tongue to stop myself from criticizing her idea.,Hold your peace,Easy,General,From physically preventing oneself from speaking
White elephant,"A possession that is useless or troublesome, especially one that is expensive to maintain or difficult to dispose of.",That old car became a white elephant; it cost more to fix than it was worth.,Useless possession,Medium,General,From the historical practice of the King of Siam giving white elephants to those he wished to ruin
Have sticky fingers,To be prone to stealing.,The manager suspected someone in the office had sticky fingers after money went missing.,Kleptomaniac,Medium,General,"From the idea of things adhering to one's fingers, implying theft"
Wouldn't harm a fly,Gentle and inoffensive; not aggressive or violent.,"Despite his tough appearance, he wouldn't harm a fly.",Harmless,Easy,General,"From the idea of not being violent even towards a small, insignificant creature"
Pardon my French,An apology for using bad language.,"That was a dreadful, pardon my French, screw-up!",Excuse my language,Easy,General,A polite way to apologize for using profanity
Out of your mind,Crazy; insane; behaving in a very foolish way.,You want to quit your stable job to travel the world? Are you out of your mind?,Crazy,Easy,General,From the idea of losing one's sanity
Have a memory like an elephant,To have an excellent memory.,She never forgets a face; she truly has a memory like an elephant.,Good memory,Easy,General,Elephants are known for their strong memory
As clear as mud,Not clear at all; very difficult to understand.,The instructions for assembling the furniture were as clear as mud.,Confusing,Easy,General,"An ironic phrase, as mud is opaque"
Take the biscuit,To be the most extreme or astonishing example of something (often used humorously or ironically).,His excuse for being late really takes the biscuit; he claimed a unicorn blocked the road!,Top it all,Medium,General,From competitions where the winner received a cake or biscuit
Put your best foot forward,To make the best possible effort; to create the best impression.,"When applying for the scholarship, make sure to put your best foot forward.",Do your best,Medium,General,From trying to start something in the best way possible"""

def clean_text(text):
    """Clean and normalize text"""
    if not text:
        return ""
    return text.strip().replace('"', '').replace('"', '').replace('"', '')

def normalize_category(category):
    """Normalize category names"""
    category = clean_text(category)
    if category.lower() in ['general education', 'general/educational']:
        return 'Education'
    elif category.lower() in ['general romantic']:
        return 'Romantic'
    elif category.lower() in ['general', 'general/educational']:
        return 'General'
    elif category.lower() == 'popular':
        return 'Popular'
    elif category.lower() == 'education':
        return 'Education'
    else:
        return category.title()

def parse_csv_data():
    """Parse the CSV data and create idioms list"""
    lines = csv_data.strip().split('\n')
    headers = [h.strip() for h in lines[0].split(',')]
    
    idioms = []
    
    for line in lines[1:]:
        if not line.strip():
            continue
            
        # Handle CSV parsing with quotes
        parts = []
        in_quotes = False
        current_part = ""
        
        i = 0
        while i < len(line):
            char = line[i]
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                parts.append(current_part.strip())
                current_part = ""
                i += 1
                continue
            
            current_part += char
            i += 1
        
        if current_part:
            parts.append(current_part.strip())
        
        if len(parts) >= 6:  # Make sure we have enough parts
            idiom = {
                "idiom": clean_text(parts[0]),
                "meaning": clean_text(parts[1]),
                "example": clean_text(parts[2]),
                "related_idiom": clean_text(parts[3]),
                "difficulty_level": clean_text(parts[4]),
                "category": normalize_category(parts[5]),
                "origin": clean_text(parts[6]) if len(parts) > 6 else ""
            }
            
            # Skip empty idioms
            if idiom["idiom"] and idiom["meaning"]:
                idioms.append(idiom)
    
    return idioms

def add_more_educational_idioms():
    """Add more educational and diverse idioms"""
    additional_idioms = [
        {
            "idiom": "Learn the ropes",
            "meaning": "To learn the basics of a job or activity",
            "example": "It took her a few weeks to learn the ropes at her new job.",
            "related_idiom": "Get the hang of it",
            "difficulty_level": "Easy",
            "category": "Education",
            "origin": "From sailing, where new sailors had to learn how to handle the ropes"
        },
        {
            "idiom": "Bright as a button",
            "meaning": "Very intelligent or clever",
            "example": "That student is as bright as a button; she always gets top marks.",
            "related_idiom": "Sharp as a tack",
            "difficulty_level": "Easy",
            "category": "Education",
            "origin": "Buttons were kept polished and shiny, representing brightness"
        },
        {
            "idiom": "Class act",
            "meaning": "Someone or something of high quality or impressive",
            "example": "The new teacher is a real class act; students love her lessons.",
            "related_idiom": "Top-notch",
            "difficulty_level": "Medium",
            "category": "Education",
            "origin": "From theatrical performances of high quality"
        },
        {
            "idiom": "School of thought",
            "meaning": "A particular philosophy or way of thinking about something",
            "example": "There are different schools of thought on how to teach mathematics.",
            "related_idiom": "Point of view",
            "difficulty_level": "Medium",
            "category": "Education",
            "origin": "From philosophical and academic traditions"
        },
        {
            "idiom": "Burning the candle at both ends",
            "meaning": "Working excessively hard, exhausting oneself",
            "example": "She's burning the candle at both ends studying for finals.",
            "related_idiom": "Working around the clock",
            "difficulty_level": "Medium",
            "category": "Education",
            "origin": "From literally burning a candle from both ends, making it burn faster"
        },
        {
            "idiom": "Rome wasn't built in a day",
            "meaning": "Complex tasks take time to complete",
            "example": "Learning a new language is difficult; remember, Rome wasn't built in a day.",
            "related_idiom": "Patience is a virtue",
            "difficulty_level": "Easy",
            "category": "Education",
            "origin": "Refers to the time it took to build the Roman Empire"
        },
        {
            "idiom": "Knowledge is power",
            "meaning": "Information and learning give you strength and advantage",
            "example": "Study hard because knowledge is power in today's world.",
            "related_idiom": "Information is key",
            "difficulty_level": "Easy",
            "category": "Education",
            "origin": "From Francis Bacon's philosophical writings"
        },
        {
            "idiom": "Think outside the box",
            "meaning": "To think creatively and unconventionally",
            "example": "To solve this problem, we need to think outside the box.",
            "related_idiom": "Be innovative",
            "difficulty_level": "Medium",
            "category": "Education",
            "origin": "From lateral thinking puzzles and creative problem-solving"
        },
        {
            "idiom": "Back to basics",
            "meaning": "Return to fundamental principles",
            "example": "When students struggle, sometimes we need to go back to basics.",
            "related_idiom": "Start from scratch",
            "difficulty_level": "Easy",
            "category": "Education",
            "origin": "From returning to core fundamentals in learning"
        },
        {
            "idiom": "Learning curve",
            "meaning": "The rate of progress in learning something new",
            "example": "There's a steep learning curve when starting computer programming.",
            "related_idiom": "Getting up to speed",
            "difficulty_level": "Medium",
            "category": "Education",
            "origin": "From graphical representation of learning progress over time"
        },
        {
            "idiom": "Break new ground",
            "meaning": "To do something innovative or pioneering",
            "example": "This research could break new ground in medical science.",
            "related_idiom": "Blaze a trail",
            "difficulty_level": "Medium",
            "category": "Popular",
            "origin": "From literally breaking soil for new construction"
        },
        {
            "idiom": "Don't count your chickens before they hatch",
            "meaning": "Don't assume success before it happens",
            "example": "I might get the promotion, but I won't count my chickens before they hatch.",
            "related_idiom": "Don't get ahead of yourself",
            "difficulty_level": "Medium",
            "category": "Popular",
            "origin": "From Aesop's fable about a milkmaid counting future profits"
        },
        {
            "idiom": "The early bird catches the worm",
            "meaning": "Success comes to those who start early",
            "example": "I always arrive early to meetings; the early bird catches the worm.",
            "related_idiom": "First come, first served",
            "difficulty_level": "Easy",
            "category": "Popular",
            "origin": "From the observation that early-rising birds find more food"
        },
        {
            "idiom": "Don't put all your eggs in one basket",
            "meaning": "Don't risk everything on one venture",
            "example": "Invest in different stocks; don't put all your eggs in one basket.",
            "related_idiom": "Diversify your options",
            "difficulty_level": "Medium",
            "category": "Popular",
            "origin": "From the risk of carrying all eggs in one container"
        },
        {
            "idiom": "Actions speak louder than words",
            "meaning": "What you do is more important than what you say",
            "example": "He promised to help, but actions speak louder than words.",
            "related_idiom": "Walk the walk",
            "difficulty_level": "Easy",
            "category": "Popular",
            "origin": "Ancient wisdom about the importance of deeds over promises"
        }
    ]
    
    return additional_idioms

def main():
    """Main function to create the comprehensive idioms JSON file"""
    print("Parsing CSV data...")
    idioms = parse_csv_data()
    
    print("Adding additional educational idioms...")
    idioms.extend(add_more_educational_idioms())
    
    print(f"Total idioms processed: {len(idioms)}")
    
    # Create the final JSON structure
    final_idioms = []
    for idiom in idioms:
        final_idioms.append({
            "idiom": idiom["idiom"],
            "meaning": idiom["meaning"],
            "example": idiom["example"],
            "related_idiom": idiom["related_idiom"],
            "difficulty_level": idiom["difficulty_level"],
            "category": idiom["category"],
            "origin": idiom["origin"]
        })
    
    # Write to JSON file
    with open('/app/backend/idioms.json', 'w', encoding='utf-8') as f:
        json.dump(final_idioms, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully created idioms.json with {len(final_idioms)} idioms")
    
    # Print statistics
    categories = {}
    difficulties = {}
    for idiom in final_idioms:
        cat = idiom["category"]
        diff = idiom["difficulty_level"]
        categories[cat] = categories.get(cat, 0) + 1
        difficulties[diff] = difficulties.get(diff, 0) + 1
    
    print("\nCategories:")
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count}")
    
    print("\nDifficulty Levels:")
    for diff, count in sorted(difficulties.items()):
        print(f"  {diff}: {count}")

if __name__ == "__main__":
    main()