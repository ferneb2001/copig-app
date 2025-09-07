procedure spalg5c
*crea archivo sptempo para listar rotulos con spalg5a
@04,01 clear to 23,78
@04,28 say 'ARMA ARCHIVO SPTEMPO    '
set delete on
*select 2
*use spprof index spprof
select 3
set exclusive on
set safety off
wfecha=date()
use sptempo
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(25)
wmatric=0
wcatego='  '
wtitulo=space(3)
wnomtit=space(25)
wdpto=0
wnomdpto=space(15)
@23,01 clear to 23,78
wsigue='S'
@06,01 say 'MATRICULA       CATEGORIA     '
@06,30 SAY 'NOMBRE:       '
do while wsigue='S'
   wop=2
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre' size 1,1
   read
   if wop=1
      wsigue='N'
   else
      if wop=2
         wnom=space(30)
         @06,30 say 'NOMBRE: '
         @23,01 say 'Indique Nombre del profesional '
         @06,38 get wnom pict '@!'
         read
         select 2
         use spprof index spprofn
         define window pnom from 08,05 to 22,75
         activate window pnom
         brow all for nombre = rtrim(wnom) in pnom
         deactivate window pnom
         wkey=str(dctipo,1)+str(dcnro,8)
         select 1
         use spmatri index spmatdo
         seek(wkey)
         if found()
            @06,11 say a.numero pict '99999'
            @06,27 say a.catego
            @06,38 say b.nombre
            do pantamu
            select 4
            use sptitu order titulo
            select 1
            set relation to titulo into sptitu
            wtitdesc=d.titdesc
            @08,17 say d.titulo
            @08,21 say d.titdesc
            @09,17 say a.habili
            @10,17 say a.condic
            wop1=2
            @23,30 get wop1 pict '@*H \<Salir;\<Grabar'
            read
            if wop1=2                   
               do arma
            endif
         else
            @06,50 say 'Sin spmatri '   
         endif         
      else
         @06,50 say 'Sin Matr¡cula '
      endif
   endif          
enddo          
@04,01 clear to 23,78
close all
return


procedure arma
*   select 2
*   seek(str(a.dctipo,1)+str(a.dcnro,8))
*   if found()
         select 3
         append blank
         replace numero with a.numero
         replace catego with a.catego
         replace titulo with a.titulo
         replace habili with a.habili
         replace condic with a.condic
         replace dctipo with b.dctipo
         replace dcnro  with b.dcnro
         replace nombre with b.nombre
         replace domici with b.domici
         replace provin with b.provin
         replace dpto   with b.dpto
         replace locali with b.locali
         replace tipodom with b.tipo
         replace telef  with ltrim(b.telef)
*   endif
return

procedure pantamu
@08,01 clear to 23,78
@08,02 say 'T¡tulo      :'
@09,02 say 'A¤o Habilit.:'
return