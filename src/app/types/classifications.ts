export interface occupancyClasifications {
	id: number,
	description: string,
	is_2008_2014:boolean
}

export interface constructionClassifications{
  id: number,
  description: string,
  is_2008_2014:boolean,
  itemName: string,
  createdBy: number,
  createdByEmployeeName: string,
  createdDate: Date,
  lastModifiedBy: number,
  lastModifiedByEmployeeName: string,
  lastModifiedDate: Date,
}

export interface multipleDwellingClassifications{
	id: number,
  	description: string
}

export interface structureOccupancyCategories{
	id: number,
  	description: string	
}

export interface primaryStructuralSystems{
	id: number,
  	description: string
}

export interface seismicDesignCategories{
	id: number,
  	description: string
}
