import bpy
from bpy import context

def getPositionX(vec):
    return vec[0]

def getPositionY(vec):
    return vec[1]

plane = context.active_object

planeVectors = []

for vertex in plane.data.vertices:
    planeVectors.append(vertex.co)

planeVectors.sort(key=getPositionX)
planeVectors.sort(key=getPositionY)

rowCount = 20
colCount = 20
rows = []

for rowIndex in range(rowCount + 1):
    row = []
    for colIndex in range(colCount + 1):
        vector = planeVectors.pop(0)
        height = round(vector[2] * 100, 2)
        row.append(height)
    rows.append(row)
    print(row)