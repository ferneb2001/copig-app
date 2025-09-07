PROCEDURE GENELMU
* Genera archivo para Municipalidades y varios
* del listado comun de profesionales
use sptlmus 
COPY TO consprf;
	FIELDS catego, numero, nombre, titotorga, domici, locali, dpto, provin, telef;
	TYPE SDF
return