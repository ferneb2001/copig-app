procedure cpcna
hide menu pant01
@03,02 clear to 23,78
@03,28 say 'INGRESO DE NOTAS POR COMISION' color n/w 
@05,03 say ' Secci¢n Letra Numero A¤o Fecha   Remitente de la nota  ';
       color n/w
wsigue='S'
wnro=0
wcod=0
select 1
use cpnsec
wnro=0
do while wsigue='S'
   wrtte=space(30)
   wnsec=space(25)
   wfecha=date()
   wdiain=date()
   wcpto1=space(75)
   wtipo=0
   wlet=space(1)
   wnota=0
   wsec=0
   wano=0
   @21,12 say 'Indique c¢digo de Comisi¢n correpondiente o <ESC> para salir' color n/w
   @22,01 say '99 para ver comisiones disponibles'
   @06,03 get wsec pict '99'
   read
   if lastkey() <>27
      if wsec = 99
         define window psec from 05,48 to 22,78 float title 'Secciones'
         activate window psec
         select 2
         use psecc index psecn
         brow nomodify in window psec
         deactivate window psec
         wnro=nro
         wnsec=nom
      else
      	 select 2
      	 use psecc
      	 locate for nro = wnro
      	 if found()
      	    wnsec=nom
      	 else
      	    @22,50 say 'No existe comision, reintente'
      	 endif
      endif	           
      @06,02 say wnro pict '99'
      @08,02 say wnsec
      @21,02 clear to 21,78
      @22,02 say 'Indique la letra '
      @06,19 get wlet pict '!'
      read
      @06,22 get wnota pict '99999'
      @06,28 get wano  pict '9999'
      @06,34 get wdiain
      @10,03 get wrtte  pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      @11,03 get wcpto1 pict 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      read
      @23,02 clear to 23,78
      werr='S'
      wop='N'
      wcod=space(1)
      @22,32 get wop picture '@*H \<Ingresa;\<No Ingresa;\<Salir' size 1,1;
             color scheme 4
      read
      @22,02 clear to 22,78
      if wop = 'S'
         werr='S'
         exit
      else   
         if wop='I'
            werr='N'
            select 1
            append blank
            replace sslet with wlet
            replace sssec with wnro
            replace ssnota with wnota
            replace ssano with wano
            replace ssremit with wrtte
            replace sstipo with wtipo
            replace ssfech with wdiain
            replace ssdet with wcpto1
         else
            werr='N'
         endif
      endif   
   else
      wsigue='N'
   endif
enddo      
close all
@04,02 clear to 23,78
do pie
SHOW MENU PANT01
RETURN

