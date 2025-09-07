procedure comr
*hide menu pant013
@03,02 clear to 23,78
@03,28 say 'INGRESO DE NOTAS POR SERVICIOS' color n/w 
@05,03 say ' Comisi¢n N£mero   Nota (L-N) Fecha   Rubro   Remitente       ';
       color n/w
*@10,01 say 'Car tula del expediente' color n/w
wsigue='S'
wnro=0
select 1
use compar
wnro=notas+1
select 2
use comri  index comrii 
do while wsigue='S'
   wmatri=0
   wcateg=space(2)
   wrtte=space(40)
   wrtte2=space(40)
   wfecha=date()
   wdiain=date()
   wsrvcio=0
   wcpto1=space(75)
   wcpto2=space(75)
   wcpto3=space(75)
   wcpto4=space(75)
   wcpto=0
   @21,01 say 'indique Comisi¢n o <ESC> para salir'
   @08,06 get wcomis pict '99'
*   wcomis=12
   @08,05 say wcomis pict '99'
   @08,14 SAY wnro pict '99999' color n/w
   wcod=space(1)
   wnnota=0
   @21,02 say 'Indique la letra o <ESC> para salir'
   @08,23 get wcod pict '!'
   read
   if lastkey()<>27
      @21,02 clear to 21,78
      @08,23 say wcod color n/w
      @21,02 say 'Indique n£mero de nota '
      @08,23 get wnnota pict '99999'
      @21,12 say 'Indique la fecha de la nota ' color n/w
      @08,32 get wfecha
      read
      @21,02 clear to 21,78
      @21,40 say 'Rubro a que corresponde la nota'
      @08,42 get wsrvcio
      read
      @21,02 clear to 21,78
      @21,08 say 'Remitente de la nota: ';
              color n/w
      @08,52 get wrtte pict '@!'
      read
      @21,02 clear to 21,78
      @23,02 clear to 23,78
      @23,12 say 'Indique res£men del contenido u oprima <ESC> para salir'
      @14,03 get wcpto1 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      @15,03 get wcpto2 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      read
      @23,02 clear to 23,78
      werr='S'
      wop='N'
      @22,32 get wop picture '@*H \<Ingresa;\<No Ingresa' size 1,1;
             color scheme 4
      read
      @22,02 clear to 22,78
      if wop='Ingresa'
         werr='N'
         select 2
         append blank
         replace codcom   with wcomis
         replace orden    with wnro
         replace srvcio   with wsrvcio
         replace comnota  with wcod
         replace comnum   with wnnota
         replace comfech  with wfecha
         replace comrte   with wrtte
         replace comcpto  with wcpto1
         replace comcpt1  with wcpto2
         select 1
         replace notas with wnro
      else
         werr='N'
      endif
   else
      wsigue='N'
   endif
enddo      
close all
@03,02 clear to 23,78
*do pie3
*SHOW MENU PANT013
RETURN

