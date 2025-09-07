procedure buscartp
parameter wnumero, wcateg
*consulta de representantes tecnicos por Matricula y Categ.del profesional
@07,01 clear to 23,78
@08,03 say 'Matr¡cula        Cat.:  '
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
select 1
use spprof index spprof, spprofn
select 2
use spmatri index spmatri
select 3
use spprofe index spprofe, spprofen
select 4
use spmatrie index spmatrie
select 5
use sprtcos index sprtcpr 
go top
wlin=11
wkeyrt=str(wnumero,5)+wcateg
do while wsigue = 's'
   locate for str(matprof,5)+categor = wkeyrt
   do while found()
      wkeyrtp=str(empresa,5)+"EM"
      if wcateg='A ' or wcateg = 'CR' 
         select 2
         use spmatri index spmatri
         seek(wkeyrt)
         if found()
            wkeyrt1=str(dctipo,1)+str(dcnro,8)
            select 1
            use spprof index spprof, spprofn
            seek(wkeyrt1)
            if found()
               @08,13 say wnumero pict '99999'
               @08,26 say wcateg  pict '!!'
               @08,33 say nombre
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
            else
               @23,01 clear to 23,79
               @23,01 say "No existe registro profesional "
            endif   
         else
            @23,01 clear to 23,79
            @23,01 say "No existe registro matricula "
         endif
      else   
         select 2
         use somatri index somatri
         seek(wkeyrt)
         if found()
            wkeyrt1=str(dctipo,1)+str(dcnro,8)
            select 1
            use soprof index soprof, soprofn
            seek(wkeyrt1)
            if found()
               @08,13 say wnumero pict '99999'
               @08,26 say wcateg  pict '!!'
               @08,33 say nombre
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
            else
               @23,01 clear to 23,79
               @23,01 say "No existe registro profesional "
            endif   
         else
            @23,01 clear to 23,79
            @23,01 say "No existe registro matricula "
         endif
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