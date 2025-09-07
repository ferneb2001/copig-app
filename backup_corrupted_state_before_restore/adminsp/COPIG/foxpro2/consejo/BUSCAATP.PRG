procedure buscaatp
parameter wnumero
*consulta de Empresas por C¢digo de Actividad
@07,01 clear to 23,78
@08,03 say 'C¢d.Actividad:  '
@10,03 say 'Empresa     Raz¢n Social      '
wsigue='s'
wfecha={  /  /  }
wfechf={  /  /  }
wcpto=space(1)
wmatrt=0
wcatrt=space(2)
wnomrt=space(30)
wkeyrt=space(7)
wkeyrpt=space(7)
wkeyrt1=space(9)
select 3
use spprofe index spprofe, spprofen
select 4
use spmatrie index spmatrie
select 5
use spmacti order codact 
go top
wlin=11
do while wsigue = 's'
   locate for str(wnumero,5) = str(codact,5)
   do while found()
      wkeyrtp=str(empresa,5)+'EM'
       select 4
           seek(wkeyrtp)
               if found()
                  @wlin,03 say numero
                  wkeyrt1=str(dctipo,1)+str(dcnro,8)
                  select 3
                  seek(wkeyrt1)
                  if found()
                     @wlin,11 say nombre
                  else
                     @23,01 say "No existe registro empresa "
                  endif   
               else
                  @23,01 clear to 23,79
                  @23,01 say "No existe registro empresa "
               endif
	  if wlin<19
        	 wlin=wlin+1
      else
        @23,01 say 'Oprima cualquier tecla para seguir'
        read
        wlin=11
        @23,01 clear to 23,78
      endif
      select 5     
      continue
   enddo
   wsigue = 'n'
enddo
wop1=0
@23,01 say 'Digite una tecla para continuar '
@23,70 get wop1 pict '9'
read
close all
@07,01 clear to 23,78
return