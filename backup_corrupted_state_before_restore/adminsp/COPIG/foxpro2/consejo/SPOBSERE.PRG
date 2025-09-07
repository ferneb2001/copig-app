procedure spobsere
parameter wkey, wkey1
@04,01 clear to 23,78
@04,20 say 'ACTUALIZACION DE OBSERVACIONES '
set heading off
set memowidth to 70
select 8
use spmemeb index spmemebm, spmemebd
went=0
wop=space(2)
went=0
@23,01 clear to 23,78
SELECT 8
seek(wkey)
if found()
   @23,01 say 'Oprima Ctrl+W para guardar los cambios o Ctrol+Q para salir sin modificar'
   modify memo mobser
   close memo mobser
else
   @05,01 clear to 22,77
   @23,10 say 'No existe, la ingresa??(SI/NO)'
   @23,41 get wop pict '!!'
   read
   if wop='SI'
      @23,01 say 'Oprima Ctrl+W para guardar los cambios o Ctrl+Q para salir sin modificar'
      append blank
      replace mnumero with val(substr(wkey,1,5))
      replace mcatego with substr(wkey,6,2)
      replace mdctipo with val(substr(wkey1,1,1))
      replace mdcnro  with val(substr(wkey1,2,8))
      modify memo mobser  
      close memo mobser
   endif   
endif      
@04,01 clear to 23,78
return