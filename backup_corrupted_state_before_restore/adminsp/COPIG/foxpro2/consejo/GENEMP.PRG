PROCEDURE genemp
* Genera archivo empresas para ecogas y varios
* del listado comun de empresas :spalemf
use empsdf 
COPY TO consemp;
	FIELDS  numero, nombre, domici, llocali, ldpto, lprovin, telef, ecuit;
	TYPE SDF
return