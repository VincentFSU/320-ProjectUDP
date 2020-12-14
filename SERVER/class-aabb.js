exports.AABB = class AABB{ 
	constructor(x, y, width, height){ 
		this.width = width; 
		this.height = height; 
		//this.bounds ={xPos:x, yPos:y, bWidth:width, bHeight: height}  
        this.bounds = {
                        xMin: x - width/2,
                        xMax: x + width/2,
                        yMin: y - height/2,
                        yMax: y + height/2
                     }; 
	} 
	updateBounds(x, y, width, height){ 
		this.bounds.xMin = x - width/2; 
		this.bounds.yMin = y - height/2; 
		this.bounds.xMax = x + width/2; 
		this.bounds.yMax = y + height/2; 
	} 
	compareBounds(a, b){ 
 
		if ((a.xMin <= b.xMin && a.xMax >= b.xMax) && (a.yMin <= b.yMin && a.yMax >= b.yMax)) return true; // full overlap	
 
		return false;
 
	} 
}