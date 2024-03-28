from bs4 import BeautifulSoup
import json
import calendar
import js2py

#Change file to delete equals and combine lines
HTMLfile = open("Insert File Name Here", "r")
contents = HTMLfile.read()
contents = contents.replace("=", "")
contents = contents.replace("\n", "")

start_keyword = input("Enter Start Date Keyword: ")
end_word = input("Enter End Date Keyword: ")
subject = input("Class Name: ")
sem = input("Enter Year: ")

"""
start_name = input("Enter Start Name Keyword: ")
end_name = input("Enter End Name Keyword: ")
"""

#beautifulsouptxt = BeautifulSoup(contents, "html.parser")
#print(beautifulsouptxt.body.prettify()) 

current_position = 0
count = 0
dates = []

"""
names = []
"""

while (current_position < len(contents)):
    start = contents.find(start_keyword, current_position)
    end = contents.find(end_word, start)
    """
    start2 = contents.find(start_name, current_position)
    end2 = contents.find(end_name, start2)
    if start2 != -1 and end2 != -1:
        start2 += len(start_name)
        name = contents[start2:end2]
        print(name)
        names.append(name)
        current_position = end2 + len(end_name)
    """
    if start != -1 and end != -1:
        start += len(start_keyword)
        dueDate = contents[start:end]
        print(dueDate)
        current_position = end + len(end_word)
        dueDate = dueDate.replace(",", "")
        dueDate = dueDate.replace("at", "")
        arr = dueDate.split()
        if len(arr) < 4:
            arr.append((arr[2])[len(arr[2])-2:])
            arr[2] = (arr[2])[0:len(arr[2])-2]
        try:
            arr[0] = str(list(calendar.month_abbr).index(arr[0]))
        except:
            arr[0] = str(list(calendar.month_name).index(arr[0]))
        if((arr[2])[1] == ":"):
            arr[2] = "0" + arr[2]
        if(len(arr[2]) == 5):
            arr = arr[:2] + [sem] + arr[2:]
        for i in range(len(arr)):
            dates.append(arr[i])
        count += 1
    else:
        if(count == 0):
            print("Keywords not found")
        break

dates.insert(0, subject)
print(dates)
json_obj = json.dumps(dates)

with open("data.json", "w") as outfile:
    outfile.write(json_obj)