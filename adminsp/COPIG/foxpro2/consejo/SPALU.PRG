procedure spalu
*Lista los datos de un profesional
@04,01 clear to 23,78
@04,26 say 'LISTA DATOS DE UN PROFESIONAL'
@06,02 say 'MATRICULA:       CATEG.:    NOMBRE:'
wsigue='S'
wmatr=0
wcate=space(2)
select 1
use spmatri index spmatri
select 2
use spprof index spprof
do while wsigue='S'
   @23,01 say 'Indique la matr¡cula del profesional a listar o <ESC> para salir'
   @06,13 get wmatr pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @23,01 say 'Indique la categor¡a'
      @06,26 get wcate pict '!!'
      read
      @23,01 clear to 23,78
      wkey=str(wmatr,5)+wcate
      select 1
      seek(wkey)
      if found()
         wkey2=str(dctipo,1)+str(dcnro,8)
         select 2
         seek(wkey2)
         if found()
            @06,38 say nombre
            wop=1
            @23,33 get wop pict '@*H \<Salir;\<Listar' size 1,1 
            read
            @23,01 clear to 23,78
            if wop=2
               do listaprof
            endif   
         else
            @06,38 say 'Sin datos personales'
         endif
      else
         @23,01 say 'No lo encontre'   
      endif
   else
      wsigue='N'
   endif   
enddo
@04,01 clear to 23,78
close all
return

procedure listaprof
wdpto=0
wprov=space(15)
select 3
use sptitu order titulo
seek(a.titulo)
if found()
   wnomtit=titdesc
else
   wnomtit=space(30)   
endif
select 3
use splocal order cod
seek(b.locali)
if found()
   wnomloc=nombre
   wdpto=dpto
else
   wnomloc=space(15)
endif
select 3
use spdpto order dpto
seek(wdpto)
if found()
   wprov=prov
   wnomdpto=nombre
else
   wnomdpto=space(15)
endif
select 3
use spprov order prov
seek(wprov)
if found()
   wnomprov=nombre
else
   wnomprov=space(15)   
endif                  
set console off
set printer on
set device to printer
???chr(27)+chr(67)+chr(18)
?'MATRICULA:        CATEG.:     NOMBRE:'
??a.numero    pict '99999' at 12
??a.catego    pict 'XX'    at 27
??b.nombre                 at 39
?'TITULO:'
??wnomtit                  at 8
?'DIRECCION:'
??rtrim(b.domici)+'-' at 12
if b.locali<>91
   ??rtrim(wnomloc)+'-'
endif
if wdpto<>1
   ??rtrim(wnomdpto)
endif
??' '+rtrim(wnomprov)      
?'DOCUMENTO '
??b.dctipo
??' '
??b.dcnro	

eject
set printer off
set device to screen
return